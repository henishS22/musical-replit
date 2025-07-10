// Declare global types for AudioWorkletProcessor
declare class AudioWorkletProcessor {
	readonly port: MessagePort
	process(
		inputs: Float32Array[][],
		outputs: Float32Array[][],
		parameters: Record<string, Float32Array>
	): boolean
}

// Make registerProcessor globally recognized
// declare function registerProcessor(
// 	name: string,
// 	processorCtor: new () => AudioWorkletProcessor
// )

declare global {
	interface Window {
		ReactNativeWebView?: {
			postMessage: (message: string) => void
		}
	}

	function registerProcessor(
		name: string,
		processorCtor: new () => AudioWorkletProcessor
	)
}

export {}
