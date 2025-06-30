import React from "react"

import { DropdownConfig } from "@/types/breadcrumbTypes"
import {
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger
} from "@nextui-org/react"
import { ChevronDown } from "lucide-react"

interface CustomDropdownProps {
	config: DropdownConfig
	className?: string
	triggerClassName?: string
	optionsClassName?: string
	isStaticIcon?: boolean
}

export function CustomDropdown({
	config: { isStatic = false, isStaticIcon = true, ...config },
	className = "",
	triggerClassName = "",
	optionsClassName = ""
}: CustomDropdownProps) {
	if (isStatic) {
		return (
			<div
				className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-xl bg-[#F4F4F4] ${className}`}
			>
				<span>{config.activeLabel}</span>
				{isStaticIcon && (
					<div className="flex flex-col">
						<ChevronDown className="w-3 h-3" />
					</div>
				)}
			</div>
		)
	}
	return (
		<div
			className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F4F4F4] ${className}`}
		>
			<Dropdown>
				<DropdownTrigger>
					<div
						className={`flex items-center gap-1 cursor-pointer w-full justify-between ${triggerClassName}`}
					>
						<span className="text-sm text-[#344054]">{config.activeLabel}</span>
						<div className="flex flex-col">
							<ChevronDown className="w-3 h-3" />
						</div>
					</div>
				</DropdownTrigger>
				<DropdownMenu
					className={`${optionsClassName}`}
					aria-label="Options"
					selectedKeys={new Set([config.value ?? ""])}
					selectionMode="single"
					onSelectionChange={(keys) => {
						const key = Array.from(keys).join("")
						if (config.onChange) config.onChange(key)
					}}
				>
					{config.options.map((option) => (
						<DropdownItem key={option.key}>{option.label}</DropdownItem>
					))}
				</DropdownMenu>
			</Dropdown>
		</div>
	)
}
