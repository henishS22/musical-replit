"use client"

import React, { ReactNode } from "react"

import { useDisclosure } from "@nextui-org/react"
import { format } from "date-fns"

import { DashboardFilterModal } from "./dashboardFilterModal"

interface TitleBadgeCardProps {
	title: string
	isFilter?: boolean
	markColor: string
	children?: ReactNode
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	selectedValue?: any
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	setSelectedValue?: any
	subComponent?: ReactNode
	titleClassName?: string
	wrapperClass?: string
	disableFutureDates?: boolean
}
export interface FilterItem {
	startDate: Date | string | number
	endDate: Date | string | number
	key: string
}
interface TitleProps {
	title: string
	color: string
	titleClassName?: string
}

const TitleBadgeCard: React.FC<TitleBadgeCardProps> = ({
	title,
	isFilter = false,
	markColor = "#000000",
	selectedValue,
	setSelectedValue,
	children,
	subComponent,
	titleClassName,
	wrapperClass = "bg-white",
	disableFutureDates = false
}) => {
	const { isOpen, onOpen, onOpenChange } = useDisclosure()
	const [filterValue, setFilterValue] = React.useState<FilterItem>({
		startDate: new Date(),
		endDate: new Date(),
		key: "selection"
	})
	// eslint-disable-next-line @typescript-eslint/no-explicit-any

	const toggleFilter = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation() // Prevent event propagation
		onOpen()
	}
	const handleConfirm = () => {
		if (setSelectedValue) {
			setSelectedValue(filterValue)
		}
		onOpenChange()
	}

	const handleReset = () => {
		setFilterValue({
			startDate: new Date(),
			endDate: new Date(),
			key: "selection"
		})
		setSelectedValue("")
	}

	return (
		<>
			<div className={`w-full p-6 rounded-xl mb-2 ${wrapperClass}`}>
				<div className="flex justify-between items-baseline relative">
					<Title
						title={title}
						color={markColor}
						titleClassName={titleClassName}
					/>
					{isFilter && (
						<div className="">
							<button
								className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md shadow-sm hover:bg-gray-300"
								onClick={toggleFilter}
							>
								{selectedValue && selectedValue.startDate !== ""
									? `${format(selectedValue.startDate, "MM/dd/yyyy")} - ${format(selectedValue.endDate, "MM/dd/yyyy")}`
									: "Select a date range"}
							</button>
						</div>
					)}
					{subComponent}
				</div>
				<div>{children}</div>

				<DashboardFilterModal
					disableFutureDates={disableFutureDates}
					isOpen={isOpen}
					onOpenChange={onOpenChange}
					selectedValue={filterValue}
					setSelectedValue={setFilterValue}
					handleConfirm={handleConfirm}
					handleReset={handleReset}
				/>
			</div>
		</>
	)
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SelectorIcon = (props: any) => {
	return (
		<svg
			aria-hidden="true"
			fill="none"
			focusable="false"
			height="1em"
			role="presentation"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="1.5"
			viewBox="0 0 24 24"
			width="1em"
			{...props}
		>
			<path d="M0 0h24v24H0z" fill="none" stroke="none" />
			<path d="M8 9l4 -4l4 4" />
			<path d="M16 15l-4 4l-4 -4" />
		</svg>
	)
}

const Title: React.FC<TitleProps> = ({ title, color, titleClassName }) => {
	return (
		<div
			className={`${titleClassName} font-semibold text-textPrimary text-xl relative pl-8 mb-6 `}
		>
			<div
				className="absolute h-full w-4 rounded top-0 left-0"
				style={{ backgroundColor: color }}
			></div>
			{title}
		</div>
	)
}

export { TitleBadgeCard, Title, SelectorIcon }
