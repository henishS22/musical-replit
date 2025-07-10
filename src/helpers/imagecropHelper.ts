// Utility function to get cropped image
export async function getCroppedImg(
	file: File,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	croppedAreaPixels: any
): Promise<Blob | null> {
	const image = await createImage(URL.createObjectURL(file))
	const canvas = document.createElement("canvas")
	const ctx = canvas.getContext("2d")

	if (!ctx) return null

	canvas.width = croppedAreaPixels.width
	canvas.height = croppedAreaPixels.height

	ctx.drawImage(
		image,
		croppedAreaPixels.x,
		croppedAreaPixels.y,
		croppedAreaPixels.width,
		croppedAreaPixels.height,
		0,
		0,
		croppedAreaPixels.width,
		croppedAreaPixels.height
	)

	return new Promise((resolve) => {
		canvas.toBlob(resolve)
	})
}

function createImage(url: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image()
		img.src = url
		img.onload = () => resolve(img)
		img.onerror = reject
	})
}
