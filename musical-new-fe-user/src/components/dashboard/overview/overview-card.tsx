import Image, { StaticImageData } from "next/image"

import { ActionLink } from "../../ui/actionLink"

interface OverviewCardProps {
	title: string
	description: string
	icon: StaticImageData
	iconWidth: number
	iconHeight: number
	actionText: string
	bgColor: string
	modalType: string
	index: number
}

export function OverviewCard({
	title,
	description,
	icon,
	iconWidth,
	iconHeight,
	actionText,
	bgColor,
	index,
	modalType
}: OverviewCardProps) {
	return (
		<div
			className={`bg-white p-6 flex flex-col h-full ${index < 3 ? "border-r border-customGray" : ""}`}
		>
			{/* <div className="absolute left-0 top-0 h-full w-[1px] bg-[#F5F5F5]" /> */}
			<div className="flex items-start justify-between gap-6">
				<div className="flex-1 min-w-0">
					<h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
					<p className="text-sm font-medium text-gray-500 leading-normal">
						{description}
					</p>
				</div>
				<div className={`rounded-full p-4 mr-6 ${bgColor} flex-shrink-0`}>
					<Image
						src={icon}
						width={iconWidth}
						height={iconHeight}
						alt={`${title} icon`}
					/>
				</div>
			</div>
			<div className="mt-auto pl-0">
				<ActionLink text={actionText} modalType={modalType} />
			</div>
		</div>
	)
}
