import React, { useEffect, useState } from "react"
import { toast } from "react-toastify"

import { updateApplicationStatus } from "@/app/api/mutation"
import { TRACK_THUMBNAIL } from "@/assets"
import CustomModal from "@/components/modal/CustomModal"
import {
	INVITE_APPLICANT_MODAL,
	REQUEST_TO_JOIN_MODAL
} from "@/constant/modalType"
import { Track } from "@/types"
import { useMutation } from "@tanstack/react-query"

import { useModalStore } from "@/stores"

import AttachedFile from "../postOpportunity/AttachedFile"
// import TabNavigation from "./TabNavigation"
import UserCard from "./UserCard"

const RequestToJoin = () => {
	const {
		customModalType,
		hideCustomModal,
		showCustomModal,
		tempCustomModalData
	} = useModalStore()

	// const [activeTab, setActiveTab] = useState("All Applications")
	const [isFavorite, setIsFavorite] = useState(false)
	const [isArchive, setIsArchive] = useState(false)

	const { mutate } = useMutation({
		mutationFn: ({
			id,
			payload
		}: {
			id: string
			payload: Record<string, boolean>
		}) => updateApplicationStatus(id, payload),
		onSuccess: (data) => {
			if (data) {
				toast.success("Application status updated successfully")
				setIsFavorite(data?.isFavorite)
				setIsArchive(data?.isArchived)
			}
		}
	})

	useEffect(() => {
		setIsFavorite(tempCustomModalData?.isFavorite)
		setIsArchive(tempCustomModalData?.isArchived)
	}, [tempCustomModalData])
	return (
		<CustomModal
			onClose={hideCustomModal}
			showModal={customModalType === REQUEST_TO_JOIN_MODAL}
			size="2xl"
		>
			<div className="flex flex-col p-6 bg-white rounded-lg max-w-[700px] max-md:px-5">
				<div className="flex flex-wrap gap-2 justify-center items-center w-full text-sm font-bold tracking-tight text-black max-md:max-w-full">
					<div className="flex-1 shrink self-stretch my-auto basis-0 max-md:max-w-full">
						Request to Join
					</div>
				</div>

				<div key={tempCustomModalData?._id}>
					<UserCard
						brief={tempCustomModalData?.brief}
						profileId={tempCustomModalData?.user?._id}
						image={tempCustomModalData?.user?.profile_img}
						name={tempCustomModalData?.user?.name}
						isFavorite={isFavorite}
						isArchive={isArchive}
						applicationId={tempCustomModalData?._id}
						handleClick={mutate}
					/>
					{tempCustomModalData?.tracks?.length > 0 &&
						tempCustomModalData?.tracks?.map((track: Track, index: number) => (
							<AttachedFile
								key={track?._id}
								audioFile={{
									...track,
									artwork: track?.artwork || TRACK_THUMBNAIL,
									duration: track?.duration?.toString() || "0",
									imageWaveBig: track?.imageWaveBig?.toString() || ""
								}}
								creator={tempCustomModalData?.user?.name}
								showTitle={false}
								showBorder={true}
								isLiked={isFavorite}
								handleFavorite={() =>
									mutate({
										id: tempCustomModalData?._id,
										payload: { isFavorite: !isFavorite }
									})
								}
								showHeading={index === 0}
							/>
						))}
				</div>

				{/* Invite Button */}
				<div className="flex flex-col items-end mt-4 w-full text-sm font-bold tracking-normal leading-6 text-black ">
					<button
						className="gap-2 rounded-lg !max-w-[165px] self-end w-full px-4 py-2 bg-aquamarine text-[13px] font-bold bg-[linear-gradient(175.57deg,#1DB653_3.76%,#0E5828_96.59%)] text-white"
						onClick={() => {
							showCustomModal({
								customModalType: INVITE_APPLICANT_MODAL,
								tempCustomModalData: {
									name: tempCustomModalData?.user?.name,
									image: tempCustomModalData?.user?.profile_img,
									applicationId: tempCustomModalData?._id,
									email: tempCustomModalData?.user?.email,
									userId: tempCustomModalData?.user?._id,
									_id: tempCustomModalData._id
								}
							})
						}}
					>
						Accept to collaborate
					</button>
				</div>
			</div>
		</CustomModal>
	)
}

export default RequestToJoin
