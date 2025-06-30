import React from "react"

import { TooltipButtonProps } from "@/types"
import { Tooltip } from "@nextui-org/react"
import { Info } from "lucide-react"

const CustomTooltip: React.FC<TooltipButtonProps> = ({
	tooltipContent,
	position = "right" // Default position
}) => {
	return (
		<Tooltip
			content={tooltipContent}
			placement={position}
			color="default"
			className="px-2 py-0.5 my-auto text-xs border border-solid rounded-[4px] bg-zinc-800 border-white border-opacity-10 text-zinc-100"
		>
			<Info color="#fff" width={16} height={16} fill="#4f4f4f" />
		</Tooltip>
	)
}

export default CustomTooltip
