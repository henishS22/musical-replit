import { memo, useEffect } from "react"
import { useFormContext } from "react-hook-form"
import { StaticImageData } from "next/image"

// import { toast } from "react-toastify"

import { fetchTrackDetails } from "@/app/api/query"
import { TRACK_THUMBNAIL } from "@/assets"
import { StartSoloModal } from "@/components/dashboard/create-module/startsolo-modal"
import SelectTrackModal from "@/components/modal/selectTrackModal"
import { TitleBadgeCard } from "@/components/ui"
import { Track } from "@/types"
import { fetchTrack } from "@/types/createOpportunityTypes"
import { useQuery } from "@tanstack/react-query"

import { useDynamicStore, useModalStore } from "@/stores"

import TrackCard from "../TrackCard"
import UploadSection from "./UploadSection"

const ProjectBrief = ({
	title,
	markColor
}: {
	title: string
	markColor: string
}) => {
	const { hideCustomModal } = useModalStore()
	const { addState, trackId, updateState, CreateOpportunity, removeState } =
		useDynamicStore()
	const {
		setValue,
		formState: { errors }
	} = useFormContext()
	const filteredTracks =
		CreateOpportunity?.selectedTracks?.filter(
			(track: Track) => track._id !== trackId?.id
		) || []

	const { data: trackDetails } = useQuery({
		queryKey: ["trackDetails", trackId],
		queryFn: () => fetchTrackDetails(trackId?.id || ""),
		enabled: !!trackId,
		staleTime: 50000
	})

	const handleSubmit = (data: fetchTrack[]) => {
		updateState("CreateOpportunity", {
			selectedTracks: data
		})
	}

	// Set the values for uploadedTrack if trackDetails is available
	useEffect(() => {
		if (trackDetails) {
			updateState("CreateOpportunity", {
				uploadedTrack: {
					_id: trackDetails?._id,
					url: trackDetails?.url,
					name: trackDetails?.name || "",
					extension: trackDetails?.extension || "",
					artist:
						(typeof trackDetails?.user === "object" &&
							(trackDetails?.user as { name: string })?.name) ||
						"",
					duration: trackDetails?.duration || 0,
					artwork: trackDetails?.artwork,
					imageWaveSmall: trackDetails?.imageWaveSmall || ""
				}
			})
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [trackDetails])

	// Set the values for brief and track in the form
	useEffect(() => {
		if (
			CreateOpportunity?.brief ||
			CreateOpportunity?.selectedTracks ||
			CreateOpportunity?.uploadedTrack
		) {
			setValue("brief", CreateOpportunity?.brief || "")
			setValue("track", [
				...(CreateOpportunity?.selectedTracks?.map(
					(track: Track) => track._id
				) || []),
				...(CreateOpportunity?.uploadedTrack
					? [CreateOpportunity?.uploadedTrack?._id]
					: [])
			])
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		CreateOpportunity?.brief,
		CreateOpportunity?.selectedTracks,
		CreateOpportunity?.uploadedTrack
	])

	return (
		<TitleBadgeCard title={title} markColor={markColor}>
			<div className="px-4 py-2 flex flex-col gap-4">
				{/* Brief Input */}
				<div className="flex flex-col mt-8 w-full max-md:max-w-full gap-1">
					<label className="font-bold text-[14px] leading-[21px] tracking-[-0.015em] text-inputLabel">
						Brief
					</label>
					<textarea
						defaultValue={CreateOpportunity?.brief || ""}
						onChange={(e) => {
							updateState("CreateOpportunity", {
								brief: e.target.value
							})
							setValue("brief", e.target.value)
						}}
						className="resize-none !h-[106px] !w-full bg-transparent border-[2px] border-hoverGray rounded-lg p-3 text-[14px] leading-[21px] tracking-[-0.015em] font-medium"
					/>
				</div>

				{/* Selected Track & Selected Tracks List */}
				<div className="flex flex-col w-full max-md:max-w-full gap-5">
					<label className="font-bold text-[14px] leading-[21px] tracking-[-0.015em] text-inputLabel">
						Files
					</label>

					<div className="max-h-[125px] overflow-y-auto flex flex-col gap-4 scrollbar">
						{/* Single Selected Track */}
						{CreateOpportunity?.uploadedTrack && (
							<TrackCard
								track={CreateOpportunity?.uploadedTrack}
								trackurl={CreateOpportunity?.uploadedTrack?.url || ""}
								mediaSrc={
									CreateOpportunity?.uploadedTrack?.imageWaveSmall || ""
								}
								imageSrc={
									(CreateOpportunity?.uploadedTrack?.artwork ||
										TRACK_THUMBNAIL) as string | StaticImageData
								}
								title={CreateOpportunity?.uploadedTrack?.name || ""}
								extension={CreateOpportunity?.uploadedTrack?.extension || ""}
								artist={CreateOpportunity?.uploadedTrack?.artist || ""}
								duration={
									Number(CreateOpportunity?.uploadedTrack?.duration) || 0
								}
								isAIGenerated={CreateOpportunity?.uploadedTrack?.isAIGenerated}
							/>
						)}

						{/* Multiple Selected Tracks */}
						{filteredTracks?.map((track: fetchTrack) => (
							<TrackCard
								track={track}
								key={track._id}
								trackurl={track.url || ""}
								mediaSrc={track.imageWaveSmall || ""}
								imageSrc={
									(track.artwork || TRACK_THUMBNAIL) as string | StaticImageData
								}
								title={track.name || ""}
								extension={track.extension || ""}
								artist={track.user?.name || ""}
								duration={track.duration || 0}
								showWaveform={true}
								isAIGenerated={track?.isAIGenerated}
							/>
						))}
					</div>
					{/* Upload & Select from Library Section */}
					<UploadSection
						handleClick={() => {
							addState("opportunity", true)
							removeState("isReleaseTrack")
						}}
					/>
				</div>
			</div>
			{(errors?.track?.message || errors?.brief?.message) && (
				<p className="text-noteRed text-[12px] font-medium leading-[18px] tracking-[-0.015em]">
					{errors?.brief?.message?.toString() ||
						errors?.track?.message?.toString()}
				</p>
			)}

			<StartSoloModal
				initialKey="upload"
				onBack={() => {
					hideCustomModal()
				}}
			/>
			<SelectTrackModal
				onSubmit={handleSubmit}
				initialData={CreateOpportunity?.selectedTracks}
			/>
		</TitleBadgeCard>
	)
}

export default memo(ProjectBrief)
