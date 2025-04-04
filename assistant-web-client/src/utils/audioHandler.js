let audioProcessor = null;
let isRecording = false;
let audioContext = null;
let micStream = null;

let playbackContext = null;
let audioQueue = [];
let isPlaying = false;
let nextPlayTime = 0;
let currentSource = null;
let onPlaybackComplete = null;

//=============================================
// Helper Functions
//=============================================
function floatTo16BitPCMBase64(float32Array) {
	// First convert to PCM16
	const buffer = new ArrayBuffer(float32Array.length * 2);
	const view = new DataView(buffer);

	for (let i = 0; i < float32Array.length; i++) {
		const s = Math.max(-1, Math.min(1, float32Array[i]));
		view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
	}

	// Convert to base64 in chunks
	let binary = '';
	const bytes = new Uint8Array(buffer);
	const chunkSize = 0x8000; // 32KB chunks

	for (let i = 0; i < bytes.length; i += chunkSize) {
		const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
		binary += String.fromCharCode.apply(null, chunk);
	}

	return btoa(binary);
}

//=============================================
// Recording Functions
//=============================================
async function startRecording(
	callback,
	sampleRate = 24000, 
	channelCount = 1, 
	echoCancellation = true, 
	noiseSuppression = true,
) {
	try {
		// Check if already recording
		if (isRecording) return { 'success': false, 'message': 'Recording already in progress.'}
		isRecording = true;

		// Check if microphone access is already granted
		const devices = await navigator.mediaDevices.enumerateDevices();
		const hasMicAccess = devices.some(device => device.kind === 'audioinput' && device.label);

		// Request microphone access
		if (!hasMicAccess) {
			await navigator.mediaDevices.getUserMedia({ audio: true });
		}

		audioContext = new(window.AudioContext || window.webkitAudioContext)({
			sampleRate: sampleRate
		});

		// Load and register the audio worklet
		await audioContext.audioWorklet.addModule('/src/utils/audioProcessor.worklet.js');

		// Get microphone access
		micStream = await navigator.mediaDevices.getUserMedia({
			audio: {
				channelCount: channelCount,
				sampleRate: sampleRate,
				echoCancellation: echoCancellation,
				noiseSuppression: noiseSuppression
			}
		});
		
		// Create audio processing pipeline
		const source = audioContext.createMediaStreamSource(micStream);
		audioProcessor = new AudioWorkletNode(audioContext, 'audio-processor');
		
		// Handle audio data from the worklet
		audioProcessor.port.onmessage = async (event) => {
			const audioData = event.data.audioData; // Assumes mono

			// Skip silent audio
			const isAudible = audioData.some(sample => Math.abs(sample) > 0.01);
			if (!isAudible) {
				console.log('Skipping silent audio chunk');
				return;
			}

			// Convert Float32Array to base64 PCM16 using proper encoding
			const base64Audio = floatTo16BitPCMBase64(audioData);
			console.log('AUDIO CHUNK');
			console.log(base64Audio);
			await callback(base64Audio);
		};

		// Connect the nodes
		source.connect(audioProcessor);
		audioProcessor.connect(audioContext.destination);

		return { 'success': true, 'message': 'Recording started successfully.' };

	} catch (e) {
		isRecording = false;
		throw e;
	}
}

function stopRecording() {
	if (!isRecording) return { 'success': false, 'message': 'No recording in progress.' };

	try {
		// Disconnect and cleanup audio pipeline
		if (audioProcessor) {
			audioProcessor.disconnect();
			audioProcessor = null;
		}

		// Stop all microphone tracks
		if (micStream) {
			micStream.getTracks().forEach(track => track.stop());
			micStream = null;
		}

		// Close audio context
		if (audioContext) {
			audioContext.close();
			audioContext = null;
		}

		isRecording = false;
		return { 'success': true, 'message': 'Recording stopped successfully.' };
	} catch (e) {
		console.error('Error stopping recording:', e);
		return { 'success': false, 'message': 'Error stopping recording: ' + e.message };
	}
}

function playAudioBuffer(base64Audio, callback) {
	try {
		// Initialize playback context if needed
		if (!playbackContext) {
			playbackContext = new (window.AudioContext || window.webkitAudioContext)({
				sampleRate: 48000  // Standard output sample rate
			});
			nextPlayTime = playbackContext.currentTime;
		}

		// Store callback
		onPlaybackComplete = callback;

		// Add to queue and start processing if not already playing
		audioQueue.push(base64Audio);
		if (!isPlaying) {
			processAudioQueue();
		}
	} catch (error) {
		console.error('Error queueing audio:', error);
	}
}

function processAudioQueue() {
	if (!isPlaying && audioQueue.length > 0) {
		isPlaying = true;
		playNextChunk();
	}
}

function playNextChunk() {
	if (audioQueue.length === 0) {
		isPlaying = false;
		if (onPlaybackComplete) {
			onPlaybackComplete();
			onPlaybackComplete = null;
		}
		return;
	}

	try {
		const base64Audio = audioQueue.shift();
		
		// Decode base64 to binary
		const binaryString = atob(base64Audio);
		const bytes = new Uint8Array(binaryString.length);
		for (let i = 0; i < binaryString.length; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}

		// Convert PCM16 to AudioBuffer with resampling
		const inputSamples = Math.floor(bytes.length / 2);
		const outputSamples = Math.floor(inputSamples * 48000 / 24000); // Resample 24kHz to 48kHz
		const audioBuffer = playbackContext.createBuffer(1, outputSamples, 48000);
		const channelData = audioBuffer.getChannelData(0);

		// Convert and resample PCM16 to float32
		const dataView = new DataView(bytes.buffer);
		for (let i = 0; i < outputSamples; i++) {
			const inputPos = i * 24000 / 48000;
			const inputIndex = Math.floor(inputPos);
			const fraction = inputPos - inputIndex;

			// Linear interpolation between samples
			const pcm16A = dataView.getInt16(inputIndex * 2, true);
			const pcm16B = inputIndex < inputSamples - 1 ? 
						  dataView.getInt16((inputIndex + 1) * 2, true) : 
						  pcm16A;

			const sampleA = pcm16A / 32768.0;
			const sampleB = pcm16B / 32768.0;
			channelData[i] = Math.max(-1, Math.min(1, 
				sampleA + fraction * (sampleB - sampleA)
			));
		}

		// Schedule playback with precise timing
		const duration = outputSamples / 48000;
		if (nextPlayTime < playbackContext.currentTime) {
			nextPlayTime = playbackContext.currentTime;
		}

		const source = playbackContext.createBufferSource();
		source.buffer = audioBuffer;
		source.connect(playbackContext.destination);
		source.start(nextPlayTime);
		currentSource = source;

		nextPlayTime += duration;
		source.onended = () => {
			currentSource = null;
			playNextChunk();
		};

	} catch (error) {
		console.error('Error processing audio chunk:', error);
		playNextChunk();
	}
}

function stopPlayback() {
	if (currentSource) {
		currentSource.stop();
		currentSource = null;
	}
	audioQueue = [];
	isPlaying = false;
	nextPlayTime = 0;
	if (onPlaybackComplete) {
		onPlaybackComplete();
		onPlaybackComplete = null;
	}
}

function isCurrentlyPlaying() {
	return isPlaying || audioQueue.length > 0;
}

export default { 
	startRecording, 
	stopRecording, 
	playAudioBuffer, 
	stopPlayback,
	isCurrentlyPlaying 
};