import React, { useState } from "react"
import { toast } from "react-toastify"

import { applySongContest } from "@/app/api/mutation"
import { TRACK_THUMBNAIL } from "@/assets"
import UploadSection from "@/components/createOpportunity/ProjectBrief/UploadSection"
import { APPLY_FOR_OPPORTUNITY_MODAL } from "@/constant/modalType"
import { Track } from "@/types"
import { fetchTrack } from "@/types/createOpportunityTypes"
import { Button } from "@nextui-org/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { useDynamicStore, useModalStore } from "@/stores"

import CustomModal from "../CustomModal"
import AttachedFile from "../postOpportunity/AttachedFile"
import SelectTrackModal from "../selectTrackModal"
import Header from "./Header"
import LinksSection from "./LinkSection"
import MessageSection from "./MessageSection"

const ApplyForOpportunity = () => {
	const { customModalType, hideCustomModal, tempCustomModalData } =
		useModalStore()
	const [message, setMessage] = useState("")
	const [links, setLinks] = useState<string[]>([])

	const { updateState, opportunityTrack } = useDynamicStore()

	const handleSubmit = (tracks: fetchTrack[]) => {
		updateState("opportunityTrack", tracks)
	}

	const queryClient = useQueryClient()
	const { mutate, isPending } = useMutation({
		mutationFn: applySongContest,
		onSuccess: (data) => {
			if (data) {
				toast.success("Application submitted successfully")
				hideCustomModal()
				queryClient.invalidateQueries({ queryKey: ["applications"] })
				setMessage("")
			}
		},
		onError: () => {
			toast.error("Application submission failed")
		}
	})

	return (
		<CustomModal
			onClose={hideCustomModal}
			showModal={customModalType === APPLY_FOR_OPPORTUNITY_MODAL}
			size="2xl"
		>
			<div className="flex flex-col p-6 bg-white rounded-lg max-w-[670px] max-h-[811px] mx-auto scrollbar overflow-auto">
				<Header
					title={tempCustomModalData?.contestData?.title}
					description={tempCustomModalData?.contestData?.brief}
				/>
				<MessageSection message={message} setMessage={setMessage} />
				{tempCustomModalData?.contestData?.tracks?.length > 0 &&
					tempCustomModalData?.contestData?.tracks?.map(
						(track: Track, index: number) => (
							<AttachedFile
								key={track?._id}
								audioFile={{
									...track,
									artwork: track?.artwork || "",
									duration: track?.duration?.toString() || "0",
									imageWaveBig: track?.imageWaveBig?.toString() || ""
								}}
								creator={tempCustomModalData?.contestData?.userId?.name}
								showHeading={index === 0}
							/>
						)
					)}
				<div className="flex flex-col mt-4 w-full">
					<div className="flex flex-col w-full text-black mb-[10px]">
						<div className="text-sm font-bold tracking-tight ">
							Upload Work <span className="text-noteRed">*</span>
						</div>
						<div className="mt-1 text-xs tracking-normal ">
							Upload your work here.
						</div>
					</div>
					{opportunityTrack?.length > 0 && (
						<div className="mb-4">
							{opportunityTrack?.map((track: Track, index: number) => (
								<AttachedFile
									key={track?._id}
									audioFile={{
										...track,
										artwork: track?.artwork || TRACK_THUMBNAIL,
										duration: track?.duration?.toString() || "",
										imageWaveBig: track?.imageWaveBig?.toString() || ""
									}}
									creator={opportunityTrack?.user?.name}
									showHeading={index === 0}
								/>
							))}
						</div>
					)}
					<UploadSection showUpload={false} />
				</div>
				<LinksSection setLinks={setLinks} links={links} />
				<div className="flex flex-wrap gap-2.5 justify-end mt-4 w-full font-bold whitespace-nowrap ">
					<button
						className="flex gap-2 items-start text-base tracking-normal leading-relaxed text-black px-5 py-2 bg-green-100 rounded-lg"
						onClick={hideCustomModal}
					>
						Cancel
					</button>
					<Button
						className="gap-2 self-stretch px-4 py-2 text-sm tracking-normal leading-6 text-white rounded-lg bg-btnColor"
						onPress={() => {
							const payload = {
								brief: message,
								files: opportunityTrack?.map((track: Track) => track?._id),
								links: links,
								songContestId: tempCustomModalData?.contestData?._id
							}
							mutate(payload)
						}}
						isLoading={isPending}
						isDisabled={
							!(
								message.length > 0 &&
								opportunityTrack &&
								opportunityTrack.length > 0
							)
						}
					>
						Submit
					</Button>
				</div>
			</div>
			<SelectTrackModal
				onSubmit={handleSubmit}
				initialData={opportunityTrack}
			/>
		</CustomModal>
	)
}

export default ApplyForOpportunity
