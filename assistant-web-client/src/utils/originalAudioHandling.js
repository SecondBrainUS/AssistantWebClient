//====================================================
// Audio Functions
//====================================================

// Add this method to handle audio playback
function processAudioQueue() {
	if (!isPlaying.value && audioQueue.value.length > 0) {
	  isPlaying.value = true;
	  
	  const playNextChunk = () => {
		if (audioQueue.value.length === 0) {
		  isPlaying.value = false;
		  return;
		}
  
		try {
		  const base64Audio = audioQueue.value.shift();
		  
		  // Decode base64 to binary data
		  const binaryString = atob(base64Audio);
		  const bytes = new Uint8Array(binaryString.length);
		  for (let i = 0; i < binaryString.length; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		  }
  
		  const inputSamples = Math.floor(bytes.length / 2);
		  const outputSamples = Math.floor(inputSamples * 48000 / 24000);
		  const audioBuffer = audioContext.value.createBuffer(1, outputSamples, 48000);
		  const channelData = audioBuffer.getChannelData(0);
  
		  // Convert PCM16 to float32 with linear interpolation
		  const dataView = new DataView(bytes.buffer);
		  for (let i = 0; i < outputSamples; i++) {
			const inputPos = i * 24000 / 48000;
			const inputIndex = Math.floor(inputPos);
			const fraction = inputPos - inputIndex;
  
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
  
		  // Calculate precise timing
		  const duration = outputSamples / 48000; // Duration in seconds
		  if (nextPlayTime.value < audioContext.value.currentTime) {
			nextPlayTime.value = audioContext.value.currentTime;
		  }
  
		  // Create and schedule the source
		  const source = audioContext.value.createBufferSource();
		  source.buffer = audioBuffer;
		  source.connect(audioContext.value.destination);
		  source.start(nextPlayTime.value);
		  currentSource.value = source;
  
		  // Schedule next chunk
		  nextPlayTime.value += duration;
		  source.onended = () => {
			currentSource.value = null;
			playNextChunk();
		  };
  
		} catch (error) {
		  console.error('Error processing audio chunk:', error);
		  playNextChunk(); // Skip problematic chunk
		}
	  };
  
	  playNextChunk();
	}
}
  
function playAudioBuffer(base64Audio) {
	try {
	  if (!audioContext.value) {
		audioContext.value = new (window.AudioContext || window.webkitAudioContext)();
	  }
  
	  // Add to queue and process
	  audioQueue.value.push(base64Audio);
	  processAudioQueue();
  
	} catch (error) {
	  console.error('Error queueing audio:', error);
	}
}
  
// Add these methods for microphone handling
/*
Do this before starting recording:

// Clear any existing audio buffer before starting
await socketClient.value?.sendMessage(selectedChat.value.id, {
	type: 'input_audio_buffer.clear'
});

*/
async function startRecording() {
	try {

		if (isProcessing.value) {
			console.log('Already processing a request, please wait...');
			return;
		}

		// Check if microphone access is already granted
		const devices = await navigator.mediaDevices.enumerateDevices();
		const hasMicAccess = devices.some(device => device.kind === 'audioinput' && device.label);

		if (!hasMicAccess) {
			// Request microphone access
			await navigator.mediaDevices.getUserMedia({ audio: true });
		}



		if (!audioContext.value) {
			audioContext.value = new (window.AudioContext || window.webkitAudioContext)({
				sampleRate: 24000
			});
		}

		// Get microphone access with specific constraints
		micStream.value = await navigator.mediaDevices.getUserMedia({
			audio: {
				channelCount: 1,          // Mono audio
				sampleRate: 24000,        // Match OpenAI's sample rate
				echoCancellation: true,
				noiseSuppression: true
			}
		});

		// Create audio processing pipeline
		const source = audioContext.value.createMediaStreamSource(micStream.value);
		audioProcessor.value = audioContext.value.createScriptProcessor(4096, 1, 1);
		
		audioProcessor.value.onaudioprocess = async (e) => {
		try {
			const inputData = e.inputBuffer.getChannelData(0);
			
			// Skip silent audio
			const isAudible = inputData.some(sample => Math.abs(sample) > 0.01);
			if (!isAudible) {
			console.log('Skipping silent audio chunk');
			return;
			}

			// Convert Float32Array to base64 PCM16 using proper encoding
			const base64Audio = floatTo16BitPCMBase64(inputData);
			
			// Send properly structured message
			if (socketClient.value && selectedChat.value?.id) {
			const message = {
				type: 'input_audio_buffer.append',
				data: {
				audio: base64Audio,
				event_id: `event_${Date.now()}`
				}
			};
			
			await socketClient.value.sendMessage(selectedChat.value.id, message);
			}
		} catch (error) {
			console.error('Error processing audio chunk:', error);
		}
		};

		// Connect the audio nodes
		source.connect(audioProcessor.value);
		audioProcessor.value.connect(audioContext.value.destination);
		
		isRecording.value = true;

	} catch (error) {
		console.error('Error starting recording:', error);
	}
}
  
  // Helper function to convert Float32Array to base64 PCM16
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
  
  async function stopRecording() {
	console.log('Stop recording called');
	try {
	  if (!isRecording.value) {
		console.log('Not recording, returning early');
		return;
	  }
	  
	  isProcessing.value = true;
	  console.log('Setting processing state');
  
	  // Stop recording
	  if (audioProcessor.value) {
		console.log('Disconnecting audio processor');
		audioProcessor.value.disconnect();
		audioProcessor.value = null;
	  }
  
	  if (micStream.value) {
		console.log('Stopping mic stream');
		micStream.value.getTracks().forEach(track => track.stop());
		micStream.value = null;
	  }
  
	  // Send final messages in correct sequence
	  if (socketClient.value?.isConnected && selectedChat.value?.id) {
		console.log('Socket state:', {
		  connected: socketClient.value.isConnected,
		  socketExists: !!socketClient.value,
		  chatId: selectedChat.value?.id
		});
		
		console.log('Sending commit message');
		// First commit the audio buffer
		await socketClient.value.sendMessage(selectedChat.value.id, {
		  type: 'input_audio_buffer.commit',
		  event_id: `event_${Date.now()}`
		});
  
		console.log('Sending response.create message');
		// Then request a response
		await socketClient.value.sendMessage(selectedChat.value.id, {
		  type: 'response.create',
		  event_id: `event_${Date.now()}`,
		  data: {
			response: {
			  modalities: ['text', 'audio'],
			  temperature: 0.7,
			  max_output_tokens: 1500
			}
		  }
		});
	  } else {
		console.error('Socket not connected or chat not selected', {
		  connected: socketClient.value?.isConnected,
		  chatId: selectedChat.value?.id,
		  socketExists: !!socketClient.value
		});
	  }
  
	} catch (error) {
	  console.error('Error stopping recording:', error);
	} finally {
	  console.log('Cleaning up recording state');
	  isRecording.value = false;
	  isProcessing.value = false;
	}
  }