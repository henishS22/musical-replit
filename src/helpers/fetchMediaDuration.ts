import { toast } from "react-toastify"

import WaveSurfer from "wavesurfer.js"

const fetchMediaDuration = async (blobUrl: string): Promise<number | null> => {
	return new Promise((resolve, reject) => {
		const waveSurfer = WaveSurfer.create({
			container: document.createElement("div"), // Hidden container
			waveColor: "transparent",
			progressColor: "transparent",
			cursorWidth: 0
		})

		waveSurfer.load(blobUrl)

		waveSurfer.on("ready", () => {
			const duration = waveSurfer.getDuration() // Duration is in seconds
			waveSurfer.destroy()
			resolve(duration)
		})

		waveSurfer.on("error", (err) => {
			toast.error(err.message)
			waveSurfer.destroy()
			reject(new Error("Failed to fetch media duration")) // Provide a custom error message
		})
	})
}

export default fetchMediaDuration
