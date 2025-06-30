/* eslint-disable no-undef */
class PCMInt16Processor extends AudioWorkletProcessor {
	constructor() {
		super()
		this.port.onmessage = (event) => {
			if (event.data === "stop") {
				// Handle any stop logic if needed
			}
		}
	}

	process(inputs) {
		const input = inputs[0]

		// Ensure input exists and has data
		if (!input || input.length === 0 || input[0].length === 0) {
			return true
		}

		const float32Array = input[0]
		const pcmInt16Array = new Int16Array(float32Array.length)

		// Convert float32 to int16
		for (let i = 0; i < float32Array.length; i++) {
			// Scale and clamp to 16-bit range
			pcmInt16Array[i] = Math.max(
				-32768,
				Math.min(32767, float32Array[i] * 32768)
			)
		}

		// Send the chunk
		this.port.postMessage(
			{
				type: "audio-chunk",
				chunk: pcmInt16Array.buffer
			},
			[pcmInt16Array.buffer]
		)

		return true
	}
}

registerProcessor("pcm-int16-processor", PCMInt16Processor)
