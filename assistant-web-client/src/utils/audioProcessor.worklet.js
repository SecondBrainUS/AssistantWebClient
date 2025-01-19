class AudioProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const inputChannel = input[0];
    if (!inputChannel) {
      console.log('[AUDIO WORKLET] No input channel')
      return false;
    }
    // Send audio data to main thread
    this.port.postMessage({
      audioData: inputChannel
    });
    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor); 