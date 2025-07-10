"use client"

import { FC } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

import { fetchStreamDetails, fetchUserData } from "@/app/api/query"
import { NFT_DETAIL_DEMO, PROFILE_IMAGE } from "@/assets"
import { LIVESTREAM_DETAIL_MODAL } from "@/constant/modalType"
import { Button } from "@nextui-org/react"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"

import { useDynamicStore, useModalStore } from "@/stores"

import CustomModal from "../CustomModal"

const LiveStreamDetail: FC = () => {
	const router = useRouter()
	const { isPublicStreams } = useDynamicStore()
	const { hideCustomModal, customModalType, tempCustomModalData } =
		useModalStore()

	// if public stream i.e ready to watch, go to view livestream, else go to host livestream
	const handleStartStream = () => {
		hideCustomModal()
		if (isPublicStreams) {
			router.push(`/view-livestream/${tempCustomModalData?.id}`)
		} else {
			router.push(`/host-livestream/${tempCustomModalData?.id}`)
		}
	}

	const { data: streamDetails } = useQuery({
		queryKey: ["streamDetails", tempCustomModalData?.id],
		queryFn: () => fetchStreamDetails(tempCustomModalData?.id)
	})

	const { data: userData } = useQuery({
		queryKey: ["userData", streamDetails?.createdById],
		queryFn: () => fetchUserData(streamDetails?.createdById as string),
		enabled: !!streamDetails?.createdById
	})

	return (
		<CustomModal
			onClose={hideCustomModal}
			showModal={customModalType === LIVESTREAM_DETAIL_MODAL}
			size="3xl"
			modalBodyClass="max-w-[680px] w-full p-6"
		>
			<div className="flex flex-col items-start gap-2 w-full">
				<div className="flex items-center gap-2">
					{isPublicStreams && (
						<div className="flex items-center gap-2">
							<div className="relative">
								<Image
									src={userData?.profile_img || PROFILE_IMAGE}
									alt="profile-image"
									className="w-12 h-12 rounded-full object-cover"
									width={48}
									height={48}
								/>
							</div>
							<span className="text-[#1A1D1F] text-base font-bold tracking-[-0.01em]">
								{userData?.name}
							</span>
						</div>
					)}
				</div>

				<Image
					src={streamDetails?.artworkUrl || NFT_DETAIL_DEMO}
					alt="livestream-detail"
					className={`w-full h-[240px] rounded-[4px] object-cover ${
						isPublicStreams ? "" : "mt-2"
					}`}
					width={680}
					height={240}
				/>

				<div className="flex flex-col w-full gap-2">
					<div className="flex justify-between items-center w-full">
						<div className="flex flex-col w-full gap-2">
							<div className="flex justify-between items-center w-full">
								<div className="text-[#1A1D1F] text-xl font-semibold leading-8 tracking-[-0.4px] turncate max-w-[200px]">
									{streamDetails?.title}
								</div>
								{streamDetails?.status === "live" && (
									<div className="flex items-center gap-1">
										<div className="self-stretch flex w-3 shrink-0 h-3 my-auto rounded-[18px] bg-red-500" />
										<span className="self-stretch my-auto">Live</span>
									</div>
								)}
							</div>
							<div className="text-[#1A1D1F] text-xs font-semibold leading-6 tracking-[-0.12px]">
								{streamDetails?.scheduleDate &&
									format(
										new Date(streamDetails?.scheduleDate),
										"do MMMM yyyy, hh:mm aa"
									)}
							</div>
							<div
								className="text-[#6F767E] text-sm font-medium leading-6 tracking-[-0.14px] max-h-[288px] scrollbar overflow-y-auto"
								dangerouslySetInnerHTML={{
									__html: streamDetails?.description || ""
								}}
							/>
						</div>
					</div>
				</div>
			</div>

			<footer className="flex justify-end w-full">
				<Button
					isDisabled={streamDetails?.status !== "live" && isPublicStreams}
					onPress={handleStartStream}
					className="bg-[linear-gradient(176deg,#1DB653_3.76%,#0E5828_96.59%)] text-[#FCFCFC] text-[13px] font-bold leading-6 tracking-[-0.13px] hover:bg-[linear-gradient(176deg,#1DB653_3.76%,#0E5828_96.59%)] hover:opacity-90"
				>
					{isPublicStreams ? "Join" : "Start"}
				</Button>
			</footer>
		</CustomModal>
	)
}

export default LiveStreamDetail
