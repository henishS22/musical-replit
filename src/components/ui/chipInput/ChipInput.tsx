"use client"

import { useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"

import { useDynamicStore } from "@/stores/dynamicStates"

import { CustomInput } from "../customInput"
import FilterOption from "../filterOption/FilterOption"
import GradientButton from "../gradientButton/gradientButton"

const ChipInput = ({
	prefix = "#",
	fieldName = "chips",
	ReadOnly = false
}: {
	prefix?: string
	fieldName?: string
	ReadOnly?: boolean
}) => {
	const addState = useDynamicStore((state) => state.addState)
	const getState = useDynamicStore((state) => state.getState)
	const chips = getState(fieldName)
	const { setValue } = useFormContext()
	const [inputValue, setInputValue] = useState("")

	const addHashtag = (tag: string) => {
		const formattedTag = tag.replace(/^[#@]/, "").trim()
		if (formattedTag) {
			const currentChips = chips || []
			if (!currentChips.includes(formattedTag)) {
				const newHashtags = [...currentChips, formattedTag]
				addState(fieldName, newHashtags)
				setValue(fieldName, newHashtags, { shouldDirty: true })
				setInputValue("")
			}
		}
	}

	const removeHashtag = (tagToRemove: string) => {
		const currentChips = chips || []
		const newHashtags = currentChips?.filter(
			(tag: string) => tag !== tagToRemove
		)
		addState(fieldName, newHashtags)
		setValue(fieldName, newHashtags, { shouldDirty: true })
	}

	useEffect(() => {
		if (!chips) {
			addState("chips", [])
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<div className="w-full">
			<div className="relative flex items-center border-2 border-hoverGray p-3 rounded-lg">
				<div className="flex-1 flex items-center flex-wrap gap-1">
					{chips?.map((tag: string) => (
						<FilterOption
							key={tag}
							label={`${prefix}${tag}`}
							onRemove={() => removeHashtag(tag)}
							remove
							classNames={{
								base: "!py-[0px] !px-2 !h-fit",
								label:
									"text-[12px] font-medium leading-[24px] tracking-[-0.01em]"
							}}
						/>
					))}
					<CustomInput
						type="text"
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						classname="flex-1 min-w-[120px] !px-0 !py-0 !mt-0 !border-none !outline-none bg-transparent !shadow-none"
						placeholder={chips?.length === 0 ? "Enter a hashtag" : ""}
					/>
				</div>
				<GradientButton
					onPress={() => addHashtag(inputValue)}
					size="sm"
					isDisabled={ReadOnly}
				>
					Add
				</GradientButton>
			</div>
		</div>
	)
}

export default ChipInput
