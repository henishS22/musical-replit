import { Schedules } from "@/components/schedules"

export const metadata = {
	title: "Schedules",
	description: "Schedules page"
}

// Server component
const SchedulesPage = () => {
	return (
		<div>
			<Schedules />
		</div>
	)
}

export default SchedulesPage
