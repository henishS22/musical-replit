import { useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"

import { fetchDesigns } from "@/app/api/query"
import {
	CustomInput,
	DashboardFilterModal,
	TitleBadgeCard
} from "@/components/ui"
import { FilterItem } from "@/components/ui/titleBadgeCard"
import { formatDateRange } from "@/helpers"
import { useDisclosure } from "@nextui-org/react"
import { useQuery } from "@tanstack/react-query"
import { Calendar } from "lucide-react"

import { useDynamicStore, useLibraryStore } from "@/stores"

import SelectableOptions from "./SelectableOptions"

const ProjectNeeds = ({
	title,
	markColor
}: {
	title: string
	markColor: string
}) => {
	const {
		setValue,
		formState: { errors }
	} = useFormContext()
	const { updateState, CreateOpportunity, engageFlow } = useDynamicStore()
	const { isOpen, onOpenChange, onOpen } = useDisclosure()
	const { instruments: skillData, genres: styleData } = useLibraryStore()
	const [durationValue, setDurationValue] = useState<FilterItem>({
		startDate: CreateOpportunity?.duration?.startDate || new Date(),
		endDate: CreateOpportunity?.duration?.endDate || new Date(),
		key: "selection"
	})

	// Fetch designs data when needed
	const { data: designsData } = useQuery({
		queryKey: ["designs"],
		queryFn: fetchDesigns,
		enabled:
			CreateOpportunity?.collaborationType === "ART_AND_DESIGN" ||
			CreateOpportunity?.collaborationType === "OTHERS"
	})

	// Determine which skills data to show based on collaborationType
	const getSkillsData = () => {
		switch (CreateOpportunity?.collaborationType) {
			case "ART_AND_DESIGN":
				return designsData || []
			case "OTHERS":
				return [...(skillData || []), ...(designsData || [])]
			case "SONG_CONTEST":
			default:
				return skillData || []
		}
	}

	const handleReset = () => {
		setDurationValue({
			startDate: new Date(),
			endDate: new Date(),
			key: "selection"
		})
	}

	const updateSelection = (
		key: "designs" | "skills" | "styles",
		value: string,
		currentItems: string[] = []
	) => {
		const newItems = currentItems.includes(value)
			? currentItems.filter((item) => item !== value)
			: [...currentItems, value]

		setValue(key, newItems)
		updateState("CreateOpportunity", {
			...CreateOpportunity,
			[key]: newItems
		})
	}

	const handleSelectionChange = (
		value: string,
		type: "skills" | "designs" | "styles" = "skills"
	) => {
		if (type === "styles") {
			updateSelection("styles", value, CreateOpportunity?.styles)
			return
		}

		if (CreateOpportunity?.collaborationType === "ART_AND_DESIGN") {
			updateSelection("designs", value, CreateOpportunity?.designs)
		} else if (CreateOpportunity?.collaborationType === "OTHERS") {
			const isDesign = designsData?.some((design) => design._id === value)
			updateSelection(
				isDesign ? "designs" : "skills",
				value,
				isDesign ? CreateOpportunity?.designs : CreateOpportunity?.skills
			)
		} else {
			updateSelection("skills", value, CreateOpportunity?.skills)
		}
	}

	const handleDurationChange = (value: FilterItem) => {
		setDurationValue(value)
		setValue("duration", {
			startDate: new Date(value?.startDate),
			endDate: new Date(value?.endDate)
		})
		updateState("CreateOpportunity", {
			duration: {
				startDate: new Date(value?.startDate),
				endDate: new Date(value?.endDate)
			}
		})
	}

	useEffect(() => {
		if (!CreateOpportunity?.duration) {
			updateState("CreateOpportunity", {
				skills: [],
				styles: [],
				duration: {
					startDate: new Date(),
					endDate: new Date()
				}
			})
		} else {
			setValue("skills", CreateOpportunity?.skills)
			setValue("styles", CreateOpportunity?.styles)
			setValue("duration", {
				startDate: new Date(CreateOpportunity?.duration?.startDate),
				endDate: new Date(CreateOpportunity?.duration?.endDate)
			})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [CreateOpportunity])

	return (
		<TitleBadgeCard title={title} markColor={markColor} titleClassName="!mb-0">
			<div className="px-4 py-2 flex flex-col gap-4">
				<SelectableOptions
					data={getSkillsData()}
					selectedItems={CreateOpportunity?.skills || []}
					onItemChange={(value) =>
						handleSelectionChange(value as string, "skills")
					}
					label={
						CreateOpportunity?.collaborationType === "SONG_CONTEST"
							? "Song Contest Skills"
							: CreateOpportunity?.collaborationType === "ART_AND_DESIGN"
								? "Design Skills"
								: "Skills"
					}
					note="Select the top skills you are searching for. We recommend 3-5 skills to find a great match."
					icon
				/>

				{/* Only show styles of when engage flow is false */}
				{!engageFlow && (
					<SelectableOptions
						data={styleData || []}
						selectedItems={CreateOpportunity?.styles || []}
						onItemChange={(value) =>
							handleSelectionChange(value as string, "styles")
						}
						label="Styles"
						note="Select the styles or genres of your project."
						icon
					/>
				)}

				<div>
					<label className="text-[14px] font-bold text-inputLabel leading-[21px] tracking-[-1.5%]">
						Duration
					</label>
					<CustomInput
						type="text"
						value={
							durationValue && durationValue.startDate !== ""
								? formatDateRange(durationValue)
								: "Select a date range"
						}
						onClick={onOpen}
						classname="border-[2px] border-hoverGray rounded-md p-3 flex justify-between cursor-pointer"
						endContent={<Calendar className="w-5 h-5" onClick={onOpen} />}
						readOnly
						wrapperClassName="max-w-[500px]"
					/>
					{(errors?.duration?.message ||
						errors?.skills?.message ||
						errors?.styles?.message) && (
						<p className="text-red-500 text-sm mt-1">
							{errors?.duration?.message?.toString() ||
								errors?.skills?.message?.toString() ||
								errors?.styles?.message?.toString()}
						</p>
					)}
				</div>
				<DashboardFilterModal
					isOpen={isOpen}
					onOpenChange={onOpenChange}
					selectedValue={durationValue}
					setSelectedValue={handleDurationChange}
					handleConfirm={() => {
						onOpenChange()
					}}
					handleReset={handleReset}
					disablePastDates={true}
				/>
			</div>
		</TitleBadgeCard>
	)
}

export default ProjectNeeds
