import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function delay(ms = 1000) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return function (x: any) {
		return new Promise((resolve) => setTimeout(() => resolve(x), ms))
	}
}

export const getTypeColor = (type: string) => {
	switch (type) {
		case "mp3":
			return "bg-green-500 text-white"
		case "mp4":
			return "bg-noteRed text-white"
		case "wav":
			return "bg-green-500 text-white"
		default:
			return "bg-gray-500 text-white"
	}
}
