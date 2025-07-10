"use client"

import { useRef, useState } from "react"

import {
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger
} from "@nextui-org/react"
import { ChevronDown } from "lucide-react"

interface Option {
	key: string
	label: string
}

interface BorderedDropdownProps {
	options: Option[]
	value?: string
	onChange: (value: string) => void
	placeholder?: string
	className?: string
}

const BorderedDropdown = ({
	options,
	value,
	onChange,
	placeholder = "Select",
	className = ""
}: BorderedDropdownProps) => {
	const [isOpen, setIsOpen] = useState(false)
	const triggerRef = useRef<HTMLDivElement>(null)

	const selectedOption = options.find((opt) => opt.key === value)

	return (
		<Dropdown
			isOpen={isOpen}
			onOpenChange={setIsOpen}
			classNames={{
				base: "w-full",
				content:
					"w-full min-w-[100px] p-0 border-2 border-customGray rounded-xl"
			}}
		>
			<DropdownTrigger>
				<div
					ref={triggerRef}
					className={`flex justify-between items-center cursor-pointer w-full p-4 border-2 border-customGray rounded-xl bg-white ${className}`}
				>
					<span className="text-[15px] text-gray-500">
						{selectedOption?.label || placeholder}
					</span>
					<ChevronDown
						className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
					/>
				</div>
			</DropdownTrigger>
			<DropdownMenu
				aria-label="Dropdown options"
				onAction={(key) => {
					onChange(key as string)
					setIsOpen(false)
				}}
				className="w-full"
			>
				{options.map((option) => (
					<DropdownItem
						key={option.key}
						className={`py-3 px-4 text-[15px] hover:bg-gray-50 data-[hover=true]:bg-gray-50 ${
							value === option.key ? "bg-gray-50" : ""
						} border-b border-gray-100 last:border-b-0`}
					>
						{option.label}
					</DropdownItem>
				))}
			</DropdownMenu>
		</Dropdown>
	)
}

export default BorderedDropdown
