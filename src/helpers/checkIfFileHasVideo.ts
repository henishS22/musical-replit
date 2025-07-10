export const checkIfMovFileHasVideo = (url: string): Promise<boolean> => {
	return new Promise((resolve) => {
		const video = document.createElement("video")
		video.preload = "metadata"
		video.src = url
		video.onloadedmetadata = function () {
			resolve(video.videoWidth > 0 && video.videoHeight > 0)
			URL.revokeObjectURL(url)
		}
		video.onerror = function () {
			resolve(false)
			URL.revokeObjectURL(url)
		}
	})
}
