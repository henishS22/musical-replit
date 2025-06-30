"use client"

import { FC, useState } from "react"
import { Calendar } from "react-date-range"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"

import "react-date-range/dist/styles.css"
import "react-date-range/dist/theme/default.css"

import {
	SCHEDULE_DATE_REQUIRED,
	SCHEDULE_TIME_REQUIRED
} from "@/constant/errorMessage"
import { SCHEDULE_POST_MODAL } from "@/constant/modalType"
import { Button, ModalBody, ModalFooter, ModalHeader } from "@nextui-org/react"
import { Calendar as CalendarIcon, Clock } from "lucide-react"

import { useDynamicStore, useModalStore } from "@/stores"

import CustomModal from "../CustomModal"

type ResetForm = {
	folder: string
	scheduleDate: string
	scheduleTime: string
}

const SchedulePostModal: FC = () => {
	const {
		hideCustomModal,
		customModalType,
		tempCustomModalData,
		modalFunction
	} = useModalStore()
	const { addState } = useDynamicStore()
	const router = useRouter()
	const [showCalendar, setShowCalendar] = useState(false)
	const [showTimePicker, setShowTimePicker] = useState(false)
	const [selectedDate, setSelectedDate] = useState<Date | null>(null)
	const [selectedTime, setSelectedTime] = useState<string>("")

	const {
		handleSubmit,
		formState: { errors },
		register,
		setValue
	} = useForm<ResetForm>()

	const hideModal = () => {
		hideCustomModal()
	}

	const formatDateToYMD = (date: Date) => {
		const year = date.getFullYear()
		const month = String(date.getMonth() + 1).padStart(2, "0")
		const day = String(date.getDate()).padStart(2, "0")
		return `${year}-${month}-${day}`
	}

	const handleDateSelect = (date: Date) => {
		setSelectedDate(date)
		setValue("scheduleDate", formatDateToYMD(date))

		setShowCalendar(false)
	}

	// Generate time slots from 12:00 PM to 11:30 PM in 30-minute intervals
	const generateTimeSlots = () => {
		const slots = []
		const now = new Date()
		const isToday =
			selectedDate &&
			selectedDate.getDate() === now.getDate() &&
			selectedDate.getMonth() === now.getMonth() &&
			selectedDate.getFullYear() === now.getFullYear()

		const currentHour = now.getHours()
		const currentMinute = now.getMinutes()

		for (let hour = 0; hour < 24; hour++) {
			const hour12 = hour % 12 === 0 ? 12 : hour % 12
			const period = hour < 12 ? "AM" : "PM"

			// For today, only show future times
			if (isToday) {
				if (hour < currentHour) continue
				if (hour === currentHour) {
					// Only show :30 slot if current time is less than :30
					if (currentMinute < 30) {
						slots.push(`${hour12}:30 ${period}`)
					}
					continue
				}
			}

			slots.push(`${hour12}:00 ${period}`)
			slots.push(`${hour12}:30 ${period}`)
		}
		return slots
	}

	const handleTimeSelect = (time: string) => {
		const [t, period] = time.split(" ")
		const [hourStr, minuteStr] = t.split(":")
		let hours = Number(hourStr) // Only hours is mutable
		const minutes = Number(minuteStr) // Const since it's never reassigned

		if (period === "PM" && hours !== 12) hours += 12
		if (period === "AM" && hours === 12) hours = 0

		const time24 = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`

		setSelectedTime(time)
		setValue("scheduleTime", time24)
		setShowTimePicker(false)
	}

	const clearCalendar = () => {
		setSelectedDate(null)
		setValue("scheduleDate", "")
		setShowCalendar(false)
	}

	const onSubmit = async (data: ResetForm) => {
		if (!tempCustomModalData.livestream) {
			addState("schedulePostData", {
				isSchedulePost: false,
				scheduleDate: data?.scheduleDate,
				scheduleTime: data?.scheduleTime
			})
			hideCustomModal()
			router.push("post-audio-or-video")
		} else {
			await addState("schedulePostData", {
				isSchedulePost: false,
				scheduleDate: data?.scheduleDate,
				scheduleTime: data?.scheduleTime
			})
			hideCustomModal()
			if (modalFunction) {
				modalFunction()
			}
		}
	}

	return (
		<CustomModal
			onClose={hideModal}
			showModal={customModalType === SCHEDULE_POST_MODAL}
			size="md"
		>
			<ModalHeader className="text-lg font-bold">
				{!tempCustomModalData?.livestream
					? "Schedule Post"
					: "Schedule Livestream"}
			</ModalHeader>
			<ModalBody>
				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="space-y-4">
						<div className="text-textGray">
							Choose a day and time in the future you want to be published.
						</div>

						<div className="">
							<div
								className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer"
								onClick={() => {
									setShowCalendar(!showCalendar)
									setShowTimePicker(false)
								}}
							>
								<CalendarIcon className="w-5 h-5" />
								<span className="text-sm text-[#344054]">
									{selectedDate
										? selectedDate.toLocaleDateString()
										: "Select date"}
								</span>
							</div>

							{showCalendar && (
								<div className="absolute z-50 mt-2 bg-white left-[453px] top-[-8px] rounded-lg shadow-lg">
									<Calendar
										date={selectedDate || new Date()}
										onChange={handleDateSelect}
										color="#1DB954"
										className="border-none"
										minDate={new Date()}
									/>
									<div className="p-2 text-right">
										<Button
											size="sm"
											color="danger"
											variant="light"
											onPress={clearCalendar}
										>
											Clear
										</Button>
									</div>
								</div>
							)}
							<input
								type="hidden"
								{...register("scheduleDate", {
									required: SCHEDULE_DATE_REQUIRED
								})}
							/>
							{errors?.scheduleDate && (
								<p className="text-red-500 text-sm mt-1">
									{errors.scheduleDate.message}
								</p>
							)}
						</div>

						<div className="">
							<div
								className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer"
								onClick={() => {
									setShowTimePicker(!showTimePicker)
									setShowCalendar(false)
								}}
							>
								<Clock className="w-5 h-5" />
								<span className="text-sm text-[#344054]">
									{selectedTime || "Select time"}
								</span>
							</div>

							{showTimePicker && (
								<div className="absolute z-50 mt-2 left-[453px] top-[-8px] bg-white rounded-lg shadow-lg max-w-[284px] overflow-y-auto w-full">
									<div className="bg-white rounded-2xl p-6 shadow-lg flex flex-col gap-6">
										{/* Header */}
										<div className="flex justify-between items-center text-lg font-medium">
											<span>{selectedTime}</span>
											{/* <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
												<X className="w-5 h-5" />
											</button> */}
										</div>

										{/* Divider */}
										<div className="border-t border-gray-200"></div>

										{/* Time List */}
										<div className="overflow-y-auto max-h-[300px] space-y-2 pr-1 grey-scrollbar">
											{generateTimeSlots().map((time) => (
												<div
													key={time}
													className={`px-4 py-2 cursor-pointer rounded-lg flex gap-2 items-center transition font-bold text-[15px] leading-6 tracking-[-0.01em]
              ${selectedTime === time ? "bg-gray-100 font-medium text-textPrimary" : "hover:bg-gray-100 text-textGray"}`}
													onClick={() => handleTimeSelect(time)}
												>
													<span>{time.split(" ")[0]}</span>
													<span className="text-gray-500">
														{time.split(" ")[1]}
													</span>
												</div>
											))}
										</div>
									</div>
								</div>
							)}
							<input
								type="hidden"
								{...register("scheduleTime", {
									required: SCHEDULE_TIME_REQUIRED
								})}
							/>
							{errors?.scheduleTime && (
								<p className="text-red-500 text-sm mt-1">
									{errors.scheduleTime.message}
								</p>
							)}
						</div>
					</div>

					<ModalFooter className="px-0">
						<Button
							type="submit"
							variant="solid"
							className="bg-btnColor text-white"
						>
							Next
						</Button>
					</ModalFooter>
				</form>
			</ModalBody>
		</CustomModal>
	)
}

export default SchedulePostModal
