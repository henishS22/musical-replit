import React from "react"

import { Select, SelectItem } from "@nextui-org/react"

interface CustomSingleSelectProps {
	label?: string
	name?: string
	errorMessage?: string
	isInvalid?: boolean
	placeholder?: string
	placement?: "inside" | "outside" | "outside-left"
	options: {
		key: string
		label: string
	}[]
	classname?: string // Optional prop for additional class names
	endContent?: React.ReactNode
	rounded?: "none" | "sm" | "md" | "lg" | "full"
	variant?: "bordered" | "underlined" | "faded"
	selectedValue?: string[]
	onChange?: (e: React.ChangeEvent<Element>) => void
	onBlur?: (e: React.FocusEvent<Element>) => void
}

const CustomSingleSelect = ({
	label,
	name,
	errorMessage,
	isInvalid,
	placeholder,
	placement,
	classname,
	options = [],
	endContent,
	rounded = "md",
	selectedValue = [],
	onChange,
	onBlur,
	...rest
}: CustomSingleSelectProps) => {
	return (
		<>
			<Select
				key={placement}
				radius={rounded}
				name={name}
				className={`w-full min-h-[42px] ${classname}`}
				classNames={{
					base: "border-none",
					mainWrapper: "border-none",
					trigger: `min-h-[42px] rounded-[5px] border ${
						isInvalid ? "border-red-500" : "border-gray-300"
					}`,
					listboxWrapper: "max-h-[400px]"
				}}
				label={label}
				labelPlacement={placement}
				placeholder={placeholder}
				endContent={endContent}
				selectedKeys={new Set(selectedValue)}
				onChange={onChange}
				onBlur={onBlur}
				{...rest}
			>
				{options?.map((item) => (
					<SelectItem key={item?.key}>{item?.label}</SelectItem>
				))}
			</Select>
			{isInvalid && <p className="mt-1 text-sm text-red-500">{errorMessage}</p>}
		</>
	)
}

export { CustomSingleSelect }
