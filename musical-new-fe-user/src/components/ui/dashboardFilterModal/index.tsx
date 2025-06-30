import React from "react"
import { DateRangePicker } from "react-date-range"

import {
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader
} from "@nextui-org/react"

import { FilterItem } from "../titleBadgeCard"

import "react-date-range/dist/styles.css" // main style file
import "react-date-range/dist/theme/default.css" // theme css file

interface DashboardFilterModalProps {
	isOpen: boolean
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	selectedValue: any
	setSelectedValue: (value: FilterItem) => void
	onOpenChange: () => void
	handleConfirm: () => void
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	handleReset: any
	disableFutureDates?: boolean
	disablePastDates?: boolean
}

export const DashboardFilterModal = ({
	isOpen = false,
	onOpenChange,
	handleConfirm,
	selectedValue,
	setSelectedValue,
	handleReset,
	disableFutureDates = false,
	disablePastDates = false
}: DashboardFilterModalProps) => {
	const handleSubmit = (): void => {
		handleConfirm()
	}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleSelect = (ranges: any) => {
		if (setSelectedValue) {
			setSelectedValue({
				startDate: ranges?.selection?.startDate,
				endDate: ranges?.selection?.endDate,
				key: ranges?.selection?.key
			})
		}
	}
	const Reset = (close: () => void) => {
		if (setSelectedValue) {
			setSelectedValue({
				startDate: "",
				endDate: "",
				key: "selection"
			})
			handleReset()
			close()
		}
	}
	return (
		<Modal
			isOpen={isOpen}
			onOpenChange={onOpenChange}
			classNames={{
				backdrop: "bg-[#F4F4F4]/90 z-60",
				wrapper: "z-60"
			}}
			size="xl"
		>
			<ModalContent>
				{(onClose) => (
					<>
						<ModalHeader className="flex flex-col gap-1">Filter</ModalHeader>
						<ModalBody>
							{selectedValue && (
								<DateRangePicker
									ranges={[
										{
											startDate: selectedValue.startDate,
											endDate: selectedValue.endDate,
											key: selectedValue.key
											// color: "#DDF5E5"
										}
									]}
									maxDate={disableFutureDates ? new Date() : undefined}
									minDate={disablePastDates ? new Date() : undefined}
									onChange={handleSelect}
									rangeColors={["#1DB954", "#DDF5E5"]}
								/>
							)}
						</ModalBody>
						<ModalFooter>
							<Button
								color="danger"
								variant="light"
								onPress={() => Reset(onClose)}
							>
								Reset
							</Button>
							<Button color="primary" onPress={handleSubmit}>
								Apply
							</Button>
						</ModalFooter>
					</>
				)}
			</ModalContent>
		</Modal>
	)
}
