import React from "react"

import FilterOption from "@/components/ui/filterOption/FilterOption"
import { Genre, Instruments } from "@/types"
import { Design, Language } from "@/types/createOpportunityTypes"

interface SelectableOptionsProps {
	data: Instruments[] | Genre[] | Language[] | Design[]
	selectedItems: string[]
	onItemChange: (itemId: string | Language) => void
	label?: string
	note?: string
	description?: string
	icon?: boolean
	classNames?: {
		base?: string
		label?: string
		optionWrapper?: string
		description?: string
	}
	customFilterLabel?: boolean
	sendWholeItem?: boolean
}

const SelectableOptions: React.FC<SelectableOptionsProps> = ({
	data,
	selectedItems,
	onItemChange,
	label,
	note,
	description,
	icon = false,
	classNames,
	customFilterLabel = false,
	sendWholeItem = false
}) => {
	return (
		<div
			className={`flex flex-col mt-8 w-full max-md:max-w-full gap-1 ${classNames?.base}`}
		>
			<label
				className={`text-[14px] font-bold text-inputLabel leading-[21px] tracking-[-1.5%] ${classNames?.label}`}
			>
				{label}
			</label>

			{description && (
				<p
					className={`text-[10px] leading-[15px] tracking-[-0.015em] font-normal text-textGray ${classNames?.description}`}
				>
					{description}
				</p>
			)}
			<div className={`flex flex-wrap gap-3 ${classNames?.optionWrapper}`}>
				{data?.map((item) => (
					<FilterOption
						key={item?._id}
						label={
							!customFilterLabel
								? item?.title
								: (item as Instruments)?.instrument
						}
						selected={selectedItems.includes(item?._id) || false}
						onPress={() =>
							sendWholeItem ? onItemChange(item) : onItemChange(item?._id)
						}
						classNames={{
							base: "!py-[0px] !px-2 !h-fit",
							label: "text-[12px] font-medium leading-[24px] tracking-[-0.01em]"
						}}
						icon={icon}
					/>
				))}
			</div>
			{note && (
				<p className="text-[10px] leading-[15px] tracking-[-0.015em] text-textGray">
					{note}
				</p>
			)}
		</div>
	)
}

export default SelectableOptions
