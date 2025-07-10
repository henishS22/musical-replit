"use client"

import React, { useMemo, useState } from "react"
import Image, { StaticImageData } from "next/image"

import {
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger
} from "@nextui-org/react"
import { ChevronDown } from "lucide-react"

interface DropdownOption {
	key: string
	label: string
	color?: "default" | "danger"
	onClick?: () => void
	image?: string | StaticImageData
}

interface CustomDropdownProps {
	options: DropdownOption[]
	selectionMode?: "none" | "single" | "multiple"
	dropdownLabel?: React.ReactNode
	defaultValue?: string
	onChange?: (key: string) => void
	className?: {
		base?: string
		list?: string
		item?: string
		trigger?: string
	}
	isDisabled?: boolean
}

const MultiDropdown: React.FC<CustomDropdownProps> = ({
	options,
	selectionMode = "none",
	dropdownLabel,
	defaultValue,
	onChange,
	className,
	isDisabled = false
}) => {
	const [selectedKeys, setSelectedKeys] = useState(
		new Set(defaultValue ? [defaultValue] : [])
	)

	const selectedValue = useMemo(
		() =>
			selectionMode === "single" ? Array.from(selectedKeys).join(", ") : "",
		[selectedKeys, selectionMode]
	)

	const handleSelectionChange = (keys: Set<string>) => {
		setSelectedKeys(keys)
		onChange?.(Array.from(keys).join(""))
	}

	return (
		<Dropdown isDisabled={isDisabled}>
			<DropdownTrigger>
				<div
					className={`flex items-center gap-2 cursor-pointer ${className?.trigger}`}
				>
					{dropdownLabel || selectedValue || "Select"}
					{!dropdownLabel && <ChevronDown className="w-4 h-4" />}
				</div>
			</DropdownTrigger>
			<DropdownMenu
				aria-label="Dropdown Menu"
				selectedKeys={selectedKeys}
				selectionMode={selectionMode}
				disallowEmptySelection={selectionMode === "single"}
				variant="flat"
				onSelectionChange={(keys) => handleSelectionChange(keys as Set<string>)}
				classNames={{
					list: className?.list,
					base: className?.base
				}}
			>
				{options.map(({ key, label, color, onClick, image }) => (
					<DropdownItem
						key={key}
						color={color || "default"}
						onPress={onClick}
						startContent={
							image ? (
								<Image src={image} alt={label} width={20} height={20} />
							) : null
						}
						className={className?.item}
					>
						{label}
					</DropdownItem>
				))}
			</DropdownMenu>
		</Dropdown>
	)
}

export default MultiDropdown
