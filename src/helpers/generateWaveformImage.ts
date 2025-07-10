import WaveSurfer, { WaveSurferOptions } from "wavesurfer.js"

interface GenerateWaveformImageProps {
	audioUrl: string // URL of the audio file
	resolution: number // Width of the image (e.g., 512 or 2048)
	waveformOptions?: WaveSurferOptions // Optional custom WaveSurfer options
}

// Function to generate waveform image
export async function generateWaveformImage({
	audioUrl,
	resolution,
	waveformOptions
}: GenerateWaveformImageProps): Promise<{ dataUrl: string; blob: Blob }> {
	return new Promise((resolve, reject) => {
		const containerId = `waveform-container-${resolution}`
		let container = document.getElementById(containerId)

		if (!container) {
			container = document.createElement("div")
			container.id = containerId
			container.style.position = "absolute"
			container.style.top = "-9999px" // Hide the container off-screen
			container.style.width = `${resolution}px` // Set the resolution width
			container.style.height = "100px" // Set a fixed height for the waveform
			document.body.appendChild(container)
		}

		const waveSurfer = WaveSurfer.create({
			container: `#${containerId}`,
			waveColor: "#E8E8E8",
			progressColor: "#33383F",
			normalize: true,
			height: 100,
			...waveformOptions // Use the provided custom options (if any)
		})

		waveSurfer.load(audioUrl)

		waveSurfer.on("ready", async () => {
			try {
				// Export image in both formats: dataURL and Blob
				const [imageDataUrl] = await waveSurfer.exportImage("png", 1, "dataURL") // Extract the first element
				const [imageBlob] = await waveSurfer.exportImage("png", 1, "blob") // Extract the first element

				// Resolve with both the data URL and Blob
				waveSurfer.destroy()
				if (container && container.parentNode) {
					container.parentNode.removeChild(container)
				}
				resolve({ dataUrl: imageDataUrl, blob: imageBlob })
			} catch (error) {
				reject(error)
			}
		})

		waveSurfer.on("error", (err) => {
			reject(err)
		})
	})
}
