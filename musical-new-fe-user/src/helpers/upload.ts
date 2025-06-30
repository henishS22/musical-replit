import Cookies from "js-cookie"

export default async function upload(
	file: ArrayBuffer | Blob | File,
	setLoader: (x: boolean) => void,
	addMediaId: (x: string) => void,
	size: number,
	extension: string,
	type: string,
	updatePercentage?: (x: number) => void
): Promise<string> {
	if (!file) {
		throw new Error("File is required")
	}
	setLoader(true)
	const isLarge = size > 10 * 1024 * 1024
	const token = Cookies.get("accessToken")

	const uploadUrl = await fetch(
		`${process.env.NEXT_PUBLIC_BASE_URL}tracks/generate-upload-url`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`
			},
			body: JSON.stringify({
				// isLocal: true,
				contentType: type,
				extension: extension
			})
		}
	)
		.then((res) => res.json())
		.catch((err) => {
			console.error("Error fetching upload URL:", err)
			setLoader(false)
			throw new Error("Failed to fetch upload URL")
		})

	if (uploadUrl?.data) {
		addMediaId(uploadUrl?.data?._id)
	}

	if (!isLarge) {
		// Simple PUT upload

		const response = await fetch(uploadUrl?.data.uploadUrl, {
			method: "PUT",
			headers: {
				"Content-Type": type
			},
			body: file
		})
		setLoader(false)
		if (!response.ok) {
			throw new Error("Upload failed")
		}
		return response.json()
	}

	// Resumable Upload
	const chunkSize = 10 * 1024 * 1024
	let offset = 0

	const uploadChunk = async (
		start: number,
		end: number,
		retries = 0
	): Promise<void> => {
		const chunk = file.slice(start, end)
		const contentRange = `bytes ${start}-${end - 1}/${size}`

		return new Promise<void>((resolve, reject) => {
			const xhr = new XMLHttpRequest()
			xhr.open("PUT", uploadUrl?.data.uploadUrl, true)
			xhr.setRequestHeader("Content-Type", type)
			xhr.setRequestHeader("Content-Range", contentRange)

			xhr.onload = () => {
				if ([200, 201, 308].includes(xhr.status)) resolve()
				else reject(new Error(`Chunk failed with status ${xhr.status}`))
			}

			xhr.onerror = () => {
				if (retries < 3) {
					const delay = 1000 * Math.pow(2, retries)
					setTimeout(() => {
						uploadChunk(start, end, retries + 1)
							.then(resolve)
							.catch(reject)
					}, delay)
				} else {
					reject(new Error("Upload failed after retries"))
				}
			}

			xhr.send(chunk)
		})
	}

	try {
		while (offset < size) {
			const end = Math.min(offset + chunkSize, size)
			await uploadChunk(offset, end)
			offset = end

			// Update the percentage if the function is provided
			if (updatePercentage) {
				const percentage = Math.round((offset / size) * 100)
				updatePercentage(percentage)
			}
		}
		setLoader(false)
		return uploadUrl
	} catch (err) {
		console.error(err)
		setLoader(false)
		throw new Error("Upload failed")
	}
}
