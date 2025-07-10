import { FC } from "react"

import { fetchTrackDetails } from "@/app/api/query"
import { PROFILE_IMAGE } from "@/assets"
import { AUDIO_VIDEO_MODAL } from "@/constant/modalType"
import { fetchTrack } from "@/types/createOpportunityTypes"
import { useQuery } from "@tanstack/react-query"

import { useDynamicStore, useModalStore, useUserStore } from "@/stores"

import CustomModal from "../CustomModal"
import MediaPlayer from "./MediaPlayer"
import { VideoPlayerHeader } from "./VideoPlayerHeader"

const AudioVideoModal: FC = () => {
	const { hideCustomModal, customModalType } = useModalStore()
	const { trackId, recentTrackId, removeState, mediaId } = useDynamicStore()
	const { userData } = useUserStore()
	const {
		data: trackDetails,
		refetch,
		isFetching
	} = useQuery({
		queryKey: ["trackDetails", trackId?._id || recentTrackId],
		queryFn: () =>
			fetchTrackDetails(
				(trackId?.mediaId as string) || (recentTrackId?.mediaId as string)
			),
		enabled: !!(trackId?._id || recentTrackId || mediaId)
	})

	const handleClose = () => {
		removeState("recentTrackId")
		removeState("url")
		hideCustomModal()
	}

	return (
		<CustomModal
			onClose={handleClose}
			showModal={customModalType === AUDIO_VIDEO_MODAL}
			size="full"
		>
			<div className="flex flex-col px-10 pt-10 pb-60 bg-zinc-50 max-md:px-5 max-md:pb-24">
				<VideoPlayerHeader
					authorImage={
						trackDetails?.user?.profile_img ||
						userData?.profile_img ||
						PROFILE_IMAGE
					}
					authorName={trackDetails?.user?.name || userData?.name || "user"}
					videoTitle={trackDetails?.name || trackId?.name || "track"}
				/>
				<div className="mt-10 flex justify-center">
					<MediaPlayer
						trackDetails={trackId || (trackDetails as fetchTrack)}
						refetch={refetch}
						isFetching={isFetching}
					/>
				</div>
			</div>
		</CustomModal>
	)
}

export default AudioVideoModal
