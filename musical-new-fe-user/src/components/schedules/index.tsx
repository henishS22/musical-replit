"use client"

import { useEffect, useState } from "react"
import { Calendar, dateFnsLocalizer } from "react-big-calendar"

import { fetchSocialMediaPostHistory } from "@/app/api/query"
import { Button } from "@nextui-org/react"
import { useQuery } from "@tanstack/react-query"
import format from "date-fns/format"
import getDay from "date-fns/getDay"
import enUS from "date-fns/locale/en-US"
import parse from "date-fns/parse"
import startOfWeek from "date-fns/startOfWeek"

import "react-big-calendar/lib/css/react-big-calendar.css"

import { SELECT_FILE_MODAL } from "@/constant/modalType"
import { Facebook, Instagram, Send, Twitter, Youtube } from "lucide-react"

import { useModalStore } from "@/stores/modal"

const locales = {
	"en-US": enUS
}

const localizer = dateFnsLocalizer({
	format,
	parse,
	startOfWeek,
	getDay,
	locales
})

interface CalendarEvent {
	title: JSX.Element | string
	start: Date
	end: Date
}

// Add this custom event component
const EventComponent = ({ event }: { event: CalendarEvent }) => {
	return (
		<div className="p-1">
			<div className="text-sm font-medium truncate bg-[#F4F4F4] text-black rounded">
				{event.title}
			</div>
		</div>
	)
}

const getPlatformIcons = (platform: string) => {
	switch (platform) {
		case "instagram":
			return <Instagram className="w-2 h-2 absolute text-white" />
		case "facebook":
			return <Facebook className="w-2 h-2 absolute text-white" />
		case "twitter":
			return <Twitter className="w-2 h-2 absolute text-white" />
		case "youtube":
			return <Youtube className="w-2 h-2 absolute text-white" />
		default:
			return <Send className="w-2 h-2 absolute text-white" />
	}
}

const getPlatformColor = (platform: string) => {
	switch (platform) {
		case "instagram":
			return "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500" // Instagram gradient
		case "facebook":
			return "bg-[#1877F2]" // Facebook blue
		case "twitter":
			return "bg-[#1DA1F2]" // Twitter blue
		case "youtube":
			return "bg-[#FF0000]" // YouTube red
		default:
			return "bg-[#1DA1F2]"
	}
}

export const Schedules = () => {
	const { showCustomModal } = useModalStore()
	const [events, setEvents] = useState<CalendarEvent[]>([])
	const { data: schedulePostData } = useQuery({
		queryKey: ["schedule-post"],
		queryFn: () => fetchSocialMediaPostHistory("type=immediate")
	})

	// Transform and set schedule data when it's available
	useEffect(() => {
		if (schedulePostData) {
			const calendarEvents = schedulePostData?.history?.flatMap((post) => {
				return (
					post?.platforms?.map((platform) => {
						return {
							title: (
								<div className="relative flex items-center">
									<div className="flex items-center gap-2">
										<span
											className={`h-4 w-4 absolute p-1 rounded-md left-1 ${getPlatformColor(platform)}`}
										>
											{getPlatformIcons(platform)}
										</span>
										<span className="ml-6 text-xs">{post.post}</span>
									</div>
								</div>
							),
							start: new Date(post.scheduleDate),
							end: new Date(post.scheduleDate)
						}
					}) || []
				)
			})
			setEvents(calendarEvents)
		}
	}, [schedulePostData])

	return (
		<div className="p-4 bg-white rounded-md">
			<div className="flex justify-between items-center mb-6">
				<div className="text-2xl font-bold">Time Schedules</div>
				<Button
					className={`font-bold rounded-md px-5 py-3 text-[15px] shadow transition-colors text-white`}
					style={{
						background:
							"linear-gradient(175.57deg, #1DB653 3.76%, #0E5828 96.59%)"
					}}
					onPress={() => {
						showCustomModal({ customModalType: SELECT_FILE_MODAL })
					}}
				>
					Schedule Post
				</Button>
			</div>

			<div className="h-[600px]">
				<Calendar
					localizer={localizer}
					events={events}
					startAccessor="start"
					endAccessor="end"
					style={{ height: "100%" }}
					components={{
						event: EventComponent
					}}
					popup
				/>
			</div>
		</div>
	)
}
