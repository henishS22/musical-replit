import { clsx, type ClassValue } from "clsx"
import { isAfter, isEqual } from "date-fns"
import DeviceDetector from "node-device-detector"
import { twMerge } from "tailwind-merge"

/**
 * Represents the structure of the user's device information.
 */
export interface UserDevice {
	os: {
		name: string
		version: string
	}
	client: {
		name: string
		type: string
	}
}

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

/**
 * Checks if the first date is equal to or after the second date.
 *
 * @param date1 - The first date to compare.
 * @param date2 - The second date to compare.
 * @returns `true` if `date1` is equal to or after `date2`, otherwise `false`.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isDateEqualOrAfter(date1: any, date2: any): boolean {
	return isEqual(date1, date2) || isAfter(date1, date2)
}

/**
 * Returns user device details based on the user agent string.
 *
 * @param userAgent - The user agent string to analyze.
 * @param deviceDetector - An instance of the DeviceDetector class.
 * @returns A promise that resolves to the user's device information.
 */
export async function getUserDeviceFromAgent(
	userAgent: string,
	deviceDetector: DeviceDetector
): Promise<UserDevice> {
	const result = deviceDetector.detect(userAgent)

	return {
		os: {
			name: result.os?.name || "Unknown",
			version: result.os?.version || "Unknown"
		},
		client: {
			type: result.client?.type || "Unknown",
			name: result.client?.name || "Unknown"
		}
	}
}
