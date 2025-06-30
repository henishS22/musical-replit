import { toast } from "react-toastify"

import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchFile, toBlobURL } from "@ffmpeg/util"

export async function convertAudioToVideo(
	audioUrl: string,
	imageUrl: string
): Promise<Blob | undefined> {
	const ffmpeg = new FFmpeg()
	const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd"

	try {
		await ffmpeg.load({
			coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
			wasmURL: await toBlobURL(
				`${baseURL}/ffmpeg-core.wasm`,
				"application/wasm"
			)
		})

		await Promise.all([
			ffmpeg.writeFile("audio.mp3", await fetchFile(audioUrl)),
			ffmpeg.writeFile("image.jpg", await fetchFile(imageUrl))
		])

		await ffmpeg.exec([
			"-loop",
			"1",
			"-i",
			"image.jpg",
			"-i",
			"audio.mp3",
			"-c:v",
			"libx264",
			"-preset",
			"ultrafast",
			"-tune",
			"stillimage",
			"-c:a",
			"aac",
			"-b:a",
			"64k",
			"-b:v",
			"500k",
			"-maxrate",
			"500k",
			"-bufsize",
			"1000k",
			"-r",
			"24",
			"-s",
			"640x360",
			"-pix_fmt",
			"yuv420p",
			"-shortest",
			"-movflags",
			"+faststart",
			"output.mp4"
		])

		const data = await ffmpeg.readFile("output.mp4")
		return new Blob([data], { type: "video/mp4" })
	} catch (error) {
		toast.error("Video conversion failed", error || "")
		// throw new Error(`Video conversion failed: ${error.message}`)
	}
}
