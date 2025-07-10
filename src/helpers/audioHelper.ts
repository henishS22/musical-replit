// eslint-disable-next-line @typescript-eslint/no-explicit-any

export const calculateDuration = async (audioUrl: string | undefined) => {
	try {
		if (!audioUrl) {
			throw new Error("Audio URL is undefined")
		}
		const response = await fetch(audioUrl)
		const arrayBuffer = await response.arrayBuffer()

		const audioContext = new AudioContext()
		const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
		return audioBuffer.duration
	} catch (error) {
		console.error("Error decoding audio for duration:", error)
	}
}
