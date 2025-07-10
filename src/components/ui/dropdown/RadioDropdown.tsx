import React from "react"

import {
	Button,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger
} from "@nextui-org/react"
import { ChevronDown } from "lucide-react"

interface RadioDropdownProps {
	options: string[] // Array of options
	selectedValue: string // Current selected value
	onSelectionChange: (value: string) => void // Callback when the selection changes
	label?: string // Optional label for the dropdown
	disable?: boolean // Optional disable state
}

const RadioDropdown: React.FC<RadioDropdownProps> = ({
	options,
	selectedValue,
	onSelectionChange,
	label,
	disable = false
}) => {
	return (
		<Dropdown
			className="max-w-[175px] w-full min-w-[129px] !rounded-none"
			isDisabled={disable}
		>
			<DropdownTrigger>
				<Button
					variant="flat"
					className="w-[145px] h-[24px] bg-[#FFBC99] rounded-[5px] flex gap-1"
				>
					{selectedValue || label || "Select"}
					<ChevronDown size={16} strokeWidth={0.75} />
				</Button>
			</DropdownTrigger>
			<DropdownMenu
				disallowEmptySelection
				aria-label="Custom item styles"
				selectedKeys={new Set([selectedValue])}
				selectionMode="single"
				onSelectionChange={(selected) =>
					onSelectionChange(Array.from(selected)[0] as string)
				}
				itemClasses={{
					base: [
						"rounded-md",
						"transition-opacity",
						"data-[hover=true]:text-foreground",
						"data-[hover=true]:bg-default-100",
						"dark:data-[hover=true]:bg-default-50",
						"data-[selectable=true]:focus:bg-default-50",
						"data-[pressed=true]:opacity-70",
						"data-[focus-visible=true]:ring-default-500",
						"max-w-[175px] w-full px-0 pl-4"
					]
				}}
				className="radio-dropdown px-0"
				hideSelectedIcon
			>
				{options.map((option, index) => (
					<DropdownItem
						key={option}
						startContent={
							<input
								type="radio"
								checked={selectedValue === option}
								readOnly
								className="radio-dropdown-input"
							/>
						}
						showDivider={options.length !== index + 1}
						className="font-normal text-sm"
					>
						<div className="text-sm">{option}</div>
					</DropdownItem>
				))}
			</DropdownMenu>
		</Dropdown>
	)
}

export default RadioDropdown
