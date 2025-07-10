import Image, { StaticImageData } from "next/image"

import { fetchProject } from "@/app/api/query"
import { EDIT_ICON, TRACK_THUMBNAIL } from "@/assets"
import { TitleBadgeCard } from "@/components/ui"
import FilterOption from "@/components/ui/filterOption/FilterOption"
import { calculateDurationDays, formatDateRange } from "@/helpers"
import { Track } from "@/types"
import { fetchTrack } from "@/types/createOpportunityTypes"
import { ProjectResponse } from "@/types/dashboarApiTypes"
import { Spinner } from "@nextui-org/react"
import { useQuery } from "@tanstack/react-query"

import { useDynamicStore, useLibraryStore } from "@/stores"

import InfoSection from "../InfoSection"
import ProjectCard from "../projectCard"
import SelectableOptions from "../ProjectNeeds/SelectableOptions"
import TrackCard from "../TrackCard"

const Summary = () => {
	const { CreateOpportunity, trackId } = useDynamicStore()
	const { updateState } = useDynamicStore()
	const { instruments, genres } = useLibraryStore()
	const durationDays = calculateDurationDays(
		formatDateRange(CreateOpportunity?.duration)
	)
	const filteredTracks =
		CreateOpportunity?.selectedTracks?.filter(
			(track: Track) => track._id !== trackId?.id
		) || []

	const { data: projectData, isPending: isProjectLoading } = useQuery({
		queryKey: ["project", CreateOpportunity?.selectedProject?._id],
		queryFn: () => fetchProject(CreateOpportunity?.selectedProject?._id),
		enabled:
			!!CreateOpportunity?.selectedProject?._id &&
			CreateOpportunity?.currentStep === 4
	})

	const EditComponent = ({ step }: { step: number }) => {
		return (
			<div
				className="flex gap-2.5 items-start self-stretch w-10 cursor-pointer"
				onClick={() => {
					updateState("CreateOpportunity", { currentStep: step })
				}}
			>
				<Image
					loading="lazy"
					src={EDIT_ICON}
					alt="Edit controls"
					width={24}
					height={24}
					className="object-contain"
				/>
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-6">
			<TitleBadgeCard
				markColor="#8A8A8A"
				title="Project"
				subComponent={<EditComponent step={0} />}
			>
				{isProjectLoading ? (
					<Spinner size="md" color="default" />
				) : (
					projectData && (
						<ProjectCard project={projectData as ProjectResponse} />
					)
				)}
			</TitleBadgeCard>

			<TitleBadgeCard
				markColor="#8A8A8A"
				title="Basic info"
				subComponent={<EditComponent step={1} />}
			>
				<div className="flex flex-col gap-4">
					<InfoSection title="Title" content={CreateOpportunity?.title || ""} />
					<SelectableOptions
						data={CreateOpportunity?.languages || []}
						label="Language"
						onItemChange={() => {}}
						selectedItems={[]}
						classNames={{
							base: "!gap-3 !mt-0"
						}}
					/>
				</div>
			</TitleBadgeCard>

			<TitleBadgeCard
				markColor="#8A8A8A"
				title="Project Needs"
				subComponent={<EditComponent step={2} />}
			>
				<div className="flex flex-col gap-4">
					{CreateOpportunity?.styles?.length > 0 && (
						<SelectableOptions
							data={
								genres.filter((item) =>
									CreateOpportunity?.styles?.includes(item?._id)
								) || []
							}
							label="Styles"
							onItemChange={() => {}}
							selectedItems={[]}
							classNames={{
								base: "!gap-3 !mt-0"
							}}
						/>
					)}
					{CreateOpportunity?.skills?.length > 0 && (
						<SelectableOptions
							data={
								instruments.filter((item) =>
									CreateOpportunity?.skills?.includes(item?._id)
								) || []
							}
							label="Skills"
							onItemChange={() => {}}
							selectedItems={[]}
							classNames={{
								base: "!gap-3 !mt-0"
							}}
						/>
					)}
					<div className="flex flex-col gap-3">
						<span className="text-[14px] font-bold text-inputLabel leading-[21px] tracking-[-1.5%]">
							Duration
						</span>
						<div className="flex flex-wrap gap-2">
							<FilterOption
								label={`${durationDays} days`}
								classNames={{
									base: "!py-[0px] !px-1 !h-fit",
									label:
										"text-[12px] font-medium leading-[24px] tracking-[-0.01em]"
								}}
							/>
						</div>
					</div>
				</div>
			</TitleBadgeCard>

			<TitleBadgeCard
				markColor="#8A8A8A"
				title="Project Brief"
				subComponent={<EditComponent step={3} />}
			>
				<div className="flex flex-col gap-4">
					<InfoSection title="Brief" content={CreateOpportunity?.brief || ""} />
					<div className="flex flex-col gap-3">
						<span className="text-[14px] font-bold text-inputLabel leading-[21px] tracking-[-1.5%]">
							Files
						</span>
						<div className="flex flex-wrap gap-2">
							<div className="max-h-[200px] w-full overflow-y-auto flex flex-col gap-4 scrollbar">
								{[CreateOpportunity?.uploadedTrack, ...filteredTracks]
									.filter(Boolean)
									.map((track: fetchTrack) => (
										<TrackCard
											track={track}
											key={track._id}
											trackurl={track?.url || ""}
											mediaSrc={track?.imageWaveSmall || ""}
											imageSrc={
												(track?.artwork || TRACK_THUMBNAIL) as
													| string
													| StaticImageData
											}
											title={track?.name || ""}
											extension={track?.extension || ""}
											artist={track?.user?.name || ""}
											duration={track?.duration || 0}
											isAIGenerated={track?.isAIGenerated}
										/>
									))}
							</div>
						</div>
					</div>
				</div>
			</TitleBadgeCard>
		</div>
	)
}

export default Summary
