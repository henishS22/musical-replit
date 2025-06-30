import ChipInput from "@/components/ui/chipInput/ChipInput"
import FilterOption from "@/components/ui/filterOption/FilterOption"
import Savebtn from "@/components/ui/savebtn/savebtn"
import { updateModalStep } from "@/helpers/modalStepHelpers"

import { useDynamicStore } from "@/stores"

const KeywordSelection = () => {
	const { addState, chips } = useDynamicStore()

	const suggestedKeywords = [
		"Pop Music",
		"Indie Music",
		"Streaming Services",
		"Local Concerts"
	]

	const handleKeywordToggle = (keyword: string) => {
		const currentChips = chips || []
		if (currentChips?.includes(keyword)) {
			const newChips = currentChips?.filter((chip: string) => chip !== keyword)
			addState("chips", newChips)
		} else {
			addState("chips", [...currentChips, keyword])
		}
	}

	return (
		<div className="p-6 flex flex-col gap-6">
			{/* Header */}
			<p className="text-[16px] font-bold text-center">Choose Your Keywords</p>

			{/* Description */}
			<p className="text-sm text-gray-600 text-center">
				Enter keywords to target or get suggestions based on your input.
			</p>

			<div className="flex flex-col gap-2">
				{/* Keyword Input */}
				<ChipInput />

				{/* Suggested Keywords */}
				<p className="text-sm font-medium mb-2">Suggested Keywords:</p>
				<div className="flex flex-wrap gap-2">
					{suggestedKeywords.map((keyword) => (
						<FilterOption
							key={keyword}
							label={keyword}
							selected={chips?.includes(keyword)}
							onPress={() => handleKeywordToggle(keyword)}
							classNames={{
								base: "border border-gray-200 !py-[0px] !px-2 !h-fit",
								label:
									"text-[12px] font-medium leading-[24px] tracking-[-0.01em]"
							}}
						/>
					))}
				</div>
			</div>

			{/* Next Button */}
			<div className="flex justify-end mt-8">
				<Savebtn
					className="w-fit self-end bg-btnColor text-white px-4 py-2 rounded-lg text-[13px] hover:bg-btnColorHover leading-[24px] font-bold tracking-[-0.01em]"
					disabled={false}
					label={"Next"}
					onClick={() => updateModalStep(3)}
				/>
			</div>
		</div>
	)
}

export default KeywordSelection
