import { FilterItem } from "@/components/ui/titleBadgeCard"
import { format, formatDistanceToNowStrict } from "date-fns"

export const formatDate = (dateValue: Date, type?: string) => {
	const dateFormat = type ? type : "MM/dd/yyyy, HH:mm"
	const date = new Date(dateValue)

	// Check if the date is valid
	if (isNaN(date.getTime())) {
		// If invalid, use today's date
		return format(new Date(), dateFormat)
	}

	return format(date, dateFormat)
}

const formatDateRange = (duration: FilterItem): string => {
	if (!duration.startDate) return "Select a date range"

	return `${format(new Date(duration.startDate), "dd MMM yy")} - ${format(new Date(duration.endDate), "dd MMM yy")}`
}

export default formatDateRange

export const formatRelativeTime = (date: string | Date) => {
	const distance = formatDistanceToNowStrict(new Date(date), {
		roundingMethod: "floor"
	})

	// Convert "1 minute" to "1 min", "2 hours" to "2 h", etc.
	return (
		distance
			.replace(" seconds", "s")
			.replace(" second", "s")
			.replace(" minutes", " min")
			.replace(" minute", " min")
			.replace(" hours", " h")
			.replace(" hour", " h") + " ago"
	)
}
