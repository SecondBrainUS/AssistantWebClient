let audioProcessor = null;
let isRecording = false;
let audioContext = null;
let micStream = null;

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

	// Then convert to base64 in chunks
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
	sampleRate = 24000, 
	channelCount = 1, 
	echoCancellation = true, 
	noiseSuppression = true
){
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
	audioProcessor.port.onmessage = (event) => {
		const audioData = event.data.audioData; // Assumes mono

		// Skip silent audio
        const isAudible = audioData.some(sample => Math.abs(sample) > 0.01);
        if (!isAudible) {
          console.log('Skipping silent audio chunk');
          return;
        }

		// Convert Float32Array to base64 PCM16 using proper encoding
		const base64Audio = floatTo16BitPCMBase64(inputData);
			
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