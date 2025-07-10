import { formatISO } from "date-fns"
import { fromZonedTime } from "date-fns-tz"

export const allowedExtensions: { [key: string]: "audio" | "video" | "other" } =
	{
		".wav": "audio",
		".mp3": "audio",
		".m4a": "audio",
		".mp4": "video",
		".mov": "video",
		".band": "other",
		".quicktime": "video",
		".zip": "other",
		".ptx": "other"
	}

export const getMediaType = (fileName: string): "audio" | "video" | "other" => {
	const extension = fileName.slice(fileName.lastIndexOf(".")).toLowerCase()
	return allowedExtensions[extension] || "other"
}

export const isValidFile = (fileName: string): boolean => {
	const extension = fileName.slice(fileName.lastIndexOf(".")).toLowerCase()
	return Object.keys(allowedExtensions).includes(extension)
}

export const fileToBase64 = (file: File) => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.readAsDataURL(file)
		reader.onload = () => resolve(reader.result)
		reader.onerror = (error) => reject(error)
	})
}

export function blobToBase64(blob: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onloadend = () => {
			if (reader.result) {
				resolve(reader.result as string) // Return full Data URL
			} else {
				reject(new Error("Failed to read Blob as Base64"))
			}
		}

		reader.onerror = () => reject(new Error("Blob reading error"))
		reader.readAsDataURL(blob)
	})
}

export function base64ToBinary(base64: string) {
	const base64String = base64.split(",")[1] // Remove metadata if present
	const byteCharacters = atob(base64String)
	const byteNumbers = new Array(byteCharacters.length)
		.fill(0)
		.map((_, i) => byteCharacters.charCodeAt(i))
	return new Uint8Array(byteNumbers)
}

export function base64ToBlobUrl(base64: string, mimeType: string): string {
	const byteCharacters = atob(base64.split(",")[1]) // Decode Base64 (remove metadata)
	const byteNumbers = new Array(byteCharacters.length)
		.fill(0)
		.map((_, i) => byteCharacters.charCodeAt(i))
	const byteArray = new Uint8Array(byteNumbers)

	const blob = new Blob([byteArray], { type: mimeType })
	return URL.createObjectURL(blob)
}

export function shortenText(
	text: string,
	maxLength: number,
	beforeEllipsis: number = 4,
	afterEllipsis: number = 4
): string {
	if (text.length <= maxLength) return text // Return original if within limit

	return text.slice(0, beforeEllipsis) + "....." + text.slice(-afterEllipsis)
}

export function getVideoThumbnail(blobUrl: string, seekTime = 1) {
	return new Promise((resolve, reject) => {
		const video = document.createElement("video")
		video.src = blobUrl
		video.crossOrigin = "anonymous" // Allow cross-origin video (if needed)
		video.muted = true // Required for autoplay
		video.playsInline = true // Fixes some mobile issues

		video.addEventListener("loadeddata", () => {
			video.currentTime = seekTime // Seek to specific timestamp
		})

		video.addEventListener("seeked", () => {
			const canvas = document.createElement("canvas")
			canvas.width = 292
			canvas.height = 196

			const ctx = canvas.getContext("2d")
			if (ctx) ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

			// Convert to Base64 Image
			const thumbnail = canvas.toDataURL("image/png")
			resolve(thumbnail)
		})

		video.addEventListener("error", (error) => {
			reject("Error loading video: " + error.message)
		})

		video.load() // Load video
	})
}

export const convertUrlToBlob = async (url: string) => {
	try {
		const response = await fetch(url)
		if (!response.ok) {
			throw new Error(`Failed to fetch image: ${response.statusText}`)
		}
		return await response.blob()
	} catch (error) {
		console.error("Error converting URL to Blob:", error)
		return null
	}
}

export function formatDate(isoString: string) {
	const date = new Date(isoString)

	return date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric"
	})
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const removeEmptyValues = (obj: Record<string, any>) => {
	return Object.fromEntries(
		Object.entries(obj).filter(
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			([_, value]) =>
				value !== "" &&
				value !== null &&
				value !== undefined &&
				!(Array.isArray(value) && value.length === 0)
		)
	)
}

export function getBase64ImageExtension(base64String: string) {
	// eslint-disable-next-line no-useless-escape
	const match = base64String.match(/^data:image\/([a-zA-Z0-9+\-]+);base64,/)
	return match ? match[1] : null
}

export const formatToISO = (
	scheduleDate: string,
	scheduleTime: string,
	timeZone = "Asia/Kolkata"
) => {
	// Combine date and time
	const dateTimeString = `${scheduleDate}T${scheduleTime}:00`

	// Convert to UTC based on timezone
	const utcDate = fromZonedTime(dateTimeString, timeZone)

	// Format as ISO string with timezone offset
	return formatISO(utcDate, { representation: "complete" })
}

export const generateUniqueFilename = (
	prefix: string = "recording",
	extension: string = "wav"
): string => {
	const timestamp = Date.now() // Get current time in milliseconds
	const randomStr = Math.random().toString(36).slice(-4) // Generate a short random string
	return `${prefix}_${timestamp}_${randomStr}.${extension}`
}

export interface FileInfo {
	size: number
	extension: string
	type: string
}

export async function getFileInfo(file: Blob | File): Promise<FileInfo> {
	if (!(file instanceof Blob)) {
		throw new Error("Expected a Blob or File object")
	}

	const size = file.size
	let extension = "mp3" // default fallback

	const mimeToExt: Record<string, string> = {
		"audio/wav": "wav",
		"audio/mpeg": "mp3",
		"audio/ogg": "ogg",
		"image/png": "png",
		"image/jpeg": "jpg",
		"application/pdf": "pdf",
		"video/mp4": "mp4",
		"audio/x-wav": "wav",
		"video/quicktime": "mov"
	}

	if (file.type && mimeToExt[file.type]) {
		extension = mimeToExt[file.type]
	}

	return { size, extension, type: file.type }
}
