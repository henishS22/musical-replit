import * as React from "react"

import { ToggleOptionProps } from "@/types"
import { Switch } from "@nextui-org/react"

import CustomTooltip from "../tooltip"

const CustomToggle: React.FC<ToggleOptionProps> = ({
	label,
	isActive,
	onClick,
	showTooltip = true,
	className,
	disabled = false
}) => {
	return (
		<div
			className={`flex flex-wrap gap-10 justify-between items-center w-full max-md:max-w-full ${className}`}
		>
			<div className="flex gap-1 items-center self-stretch my-auto text-sm font-semibold tracking-normal leading-6 whitespace-nowrap text-neutral-700">
				{label && <div className="self-stretch my-auto">{label}</div>}
				{showTooltip && <CustomTooltip tooltipContent="Select type" />}
			</div>
			<Switch
				isSelected={isActive}
				color="success"
				onValueChange={onClick}
				isDisabled={disabled}
			/>
		</div>
	)
}

export default CustomToggle
