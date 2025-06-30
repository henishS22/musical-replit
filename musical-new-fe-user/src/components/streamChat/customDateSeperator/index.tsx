import { DateSeparator, DateSeparatorProps } from "stream-chat-react"

const CustomDateSeparator = (props: DateSeparatorProps) => {
	const { date } = props

	return <DateSeparator date={date} position={"center"} />
}

export default CustomDateSeparator
