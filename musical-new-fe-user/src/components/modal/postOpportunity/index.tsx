import React from "react"
import Image from "next/image"

import {
	fetchApplicationsBySongContestId,
	fetchProject,
	fetchSongContest
} from "@/app/api/query"
import { PROFILE_IMAGE } from "@/assets"
import {
	APPLY_FOR_OPPORTUNITY_MODAL,
	POST_OPPORTUNITY_MODAL
} from "@/constant/modalType"
import { Track } from "@/types"
import { useQuery } from "@tanstack/react-query"

import { useDynamicStore, useModalStore, useUserStore } from "@/stores"

import CustomModal from "../CustomModal"
import AttachedFile from "./AttachedFile"
import ProfileInfo from "./ProfileInfo"
import TagList from "./Taglist"

interface PostOpportunityModalProps {
	savedOpportunities: string[]
}

const PostOpportunityModal: React.FC<PostOpportunityModalProps> = ({
	savedOpportunities
}) => {
	const {
		customModalType,
		hideCustomModal,
		tempCustomModalData,
		showCustomModal
	} = useModalStore()

	const { user } = useUserStore()
	const { removeState } = useDynamicStore()

	const { data } = useQuery({
		queryKey: ["songContest", tempCustomModalData],
		queryFn: () => fetchSongContest(tempCustomModalData?.contestId),
		enabled: !!tempCustomModalData && !!tempCustomModalData?.contestId,
		staleTime: 300000
	})

	const { data: applications } = useQuery({
		queryKey: ["applications", tempCustomModalData],
		queryFn: () =>
			fetchApplicationsBySongContestId(tempCustomModalData?.contestId),
		enabled: !!tempCustomModalData && !!tempCustomModalData?.contestId,
		staleTime: 300000
	})

	const { data: projectData } = useQuery({
		queryKey: ["project", tempCustomModalData],
		queryFn: () => fetchProject(tempCustomModalData?.projectId),
		enabled: !!tempCustomModalData && !!tempCustomModalData?.projectId,
		staleTime: 300000
	})

	const formattedDate = new Date(data?.updatedAt).toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "long"
	})

	const isApplied =
		applications?.length &&
		applications?.some(
			(application: { user: { _id: string } }) =>
				application?.user?._id === user?.id
		)

	const isOwner = data?.userId?._id === user?.id

	const currentTime = new Date()
	const startFromDate = new Date(data?.startFrom)
	const endToDate = new Date(data?.endTo)

	const notStarted = currentTime < startFromDate
	const expired = currentTime > endToDate

	const getStatusText = (
		notStarted: boolean,
		expired: boolean,
		isApplied: boolean
	) => {
		switch (true) {
			case isApplied:
				return "Applied"
			case expired:
				return "Opportunity Expired"
			case notStarted:
				return "Opportunity Not Started"
			default:
				return "Apply to Opportunity"
		}
	}

	return (
		<CustomModal
			onClose={hideCustomModal}
			showModal={customModalType === POST_OPPORTUNITY_MODAL}
			size="2xl"
		>
			<div className="flex flex-col p-6 bg-white rounded-lg">
				<div className="flex flex-wrap gap-2 justify-center items-center w-full text-sm font-bold tracking-tight text-neutral-700 text-opacity-0 max-md:max-w-full">
					<div className="flex-1 shrink self-stretch my-auto basis-0 max-md:max-w-full">
						Upload new work
					</div>
				</div>
				<ProfileInfo
					userName={data?.userId?.name || ""}
					userImage={data?.userId?.profile_img || PROFILE_IMAGE}
					userId={data?.userId?._id}
					isSaved={
						savedOpportunities?.includes(tempCustomModalData?.contestId) ||
						false
					}
					id={tempCustomModalData?.contestId}
				/>
				<Image
					loading="lazy"
					src={projectData?.artworkUrl || ""}
					className="object-contain mt-4 w-full rounded aspect-[2.63]"
					alt={`artwork`}
					width={680}
					height={300}
				/>
				<div className="flex flex-col mt-4 w-full max-w-[632px] max-md:max-w-full">
					<div className="flex flex-wrap gap-10 justify-between items-start w-full max-md:max-w-full">
						<div className="text-base font-bold tracking-normal text-zinc-900">
							{data?.title || ""}
						</div>
						<div className="text-xs font-medium tracking-normal leading-6 text-gray-500">
							{formattedDate || ""}
							{applications?.length > 0
								? " | " + applications?.length + " applicant"
								: ""}
						</div>
					</div>
					<div className="mt-2 text-sm font-medium tracking-normal leading-6 text-gray-500 max-md:max-w-full">
						{data?.brief}
					</div>
				</div>
				<TagList
					tags={data?.seeking?.map(
						(seeking: { title: { en: string } }) => seeking?.title?.en
					)}
				/>
				{data?.tracks?.length > 0 &&
					data?.tracks?.map((track: Track, index: number) => (
						<AttachedFile
							key={track?._id}
							audioFile={{
								...track,
								artwork: track?.artwork || "",
								duration: track?.duration?.toString() || "0",
								imageWaveBig: track?.imageWaveBig?.toString() || ""
							}}
							creator={data?.userId?.name}
							showHeading={index === 0}
						/>
					))}
				{!isOwner && (
					<button
						className="gap-2 self-start px-4 py-2 mt-4 text-sm font-bold tracking-normal leading-6 rounded-lg text-zinc-50 bg-[linear-gradient(175.57deg,#1DB653_3.76%,#0E5828_96.59%)]"
						disabled={isApplied || notStarted || expired}
						onClick={() => {
							removeState("opportunityTrack")
							showCustomModal({
								customModalType: APPLY_FOR_OPPORTUNITY_MODAL,
								tempCustomModalData: {
									contestData: data
								}
							})
						}}
					>
						{getStatusText(notStarted, expired, isApplied)}
					</button>
				)}
			</div>
		</CustomModal>
	)
}

export default PostOpportunityModal
