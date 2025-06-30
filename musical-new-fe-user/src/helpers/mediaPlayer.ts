export const dispatchMediaEvent = (
	eventName: string,
	details: {
		duration?: number
		isVideo?: boolean
		currentTime?: number
		previousTime?: number
		newTime?: number
		seekAmount?: number
		autoplay?: boolean
		trackId?: string
	}
) => {
	document.dispatchEvent(
		new CustomEvent(eventName, {
			detail: details
		})
	)
}
