"use client"

import { useDynamicStore } from "@/stores/dynamicStates"

import ChipInput from "../ui/chipInput/ChipInput"
import FilterOption from "../ui/filterOption/FilterOption"

const HashtagsSection = ({
	suggestedHashtags
}: {
	suggestedHashtags: string[]
	prefix?: "#" | "@"
	fieldName?: string
}) => {
	const { addState, chips } = useDynamicStore()

	const handleChipToggle = (tag: string) => {
		// Remove both # and @ from the tag to handle both cases
		const formattedTag = tag.replace(/^[#@]/, "").trim()
		const currentChips = chips || []
		if (currentChips?.includes(formattedTag)) {
			const newChips = currentChips?.filter(
				(chip: string) => chip !== formattedTag
			)
			addState("chips", newChips)
		} else {
			addState("chips", [...currentChips, formattedTag])
		}
	}

	return (
		<div className="flex flex-col w-full">
			<ChipInput fieldName="chips" />
			{suggestedHashtags.length > 0 && (
				<div className="mt-4">
					<p className="text-sm text-gray-600 mb-2">Suggested Hashtags</p>
					<div className="flex flex-wrap gap-2">
						{suggestedHashtags.map((tag) => (
							<FilterOption
								key={tag}
								label={`${tag}`}
								selected={chips?.includes(tag)}
								onPress={() => {
									handleChipToggle(tag)
								}}
								classNames={{
									base: "!py-[0px] !px-2 !h-fit",
									label:
										"text-[12px] font-medium leading-[24px] tracking-[-0.01em]"
								}}
							/>
						))}
					</div>
				</div>
			)}
		</div>
	)
}

export default HashtagsSection
