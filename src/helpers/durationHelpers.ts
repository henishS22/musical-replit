import { differenceInDays, parse } from "date-fns"

const calculateDurationDays = (durationStr?: string): number | null => {
	if (!durationStr) return null

	const [startStr, endStr] = durationStr.split(" - ")

	if (!startStr || !endStr) return null

	const startDate = parse(startStr, "dd MMM yy", new Date())
	const endDate = parse(endStr, "dd MMM yy", new Date())

	return differenceInDays(endDate, startDate)
}

export default calculateDurationDays
