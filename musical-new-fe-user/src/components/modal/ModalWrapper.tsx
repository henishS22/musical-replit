"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

import {
	fetchSubscriptionFeatureAvailability,
	fetchUserData
} from "@/app/api/query"
import {
	AddCollabModal,
	AddIpModal,
	ExistingProModal,
	RecordingComplete,
	ReleaseModal
} from "@/components/modal"
import {
	AUDIO_VIDEO_MODAL,
	ENGAGE_MODAL,
	RELEASE_MODULE_MODAL
} from "@/constant/modalType"
import { useQuery } from "@tanstack/react-query"
import Cookies from "js-cookie"

import { useDynamicStore, useModalStore, useUserStore } from "@/stores"

import { InviteCollaboratorModal } from "../dashboard/createModalInvite/invite-collaborator-modal"
import { MediaPlayer } from "../mediaPlayer"
import AudioVideoModal from "./audioVideoModal"
import BuyNFTModal from "./buyNftModal/BuyNFTModal"
import ComingSoonModal from "./comingSoon/ComingSoonModal"
import PostCommunityTopicModal from "./communityTopicModal/PostCommunityTopicModal"
import { ConfirmationModal } from "./confirmationModal"
import { CreateQuest } from "./createQuest/CreateQuest"
import EngageModal from "./engageModal"
import EngageSocialModal from "./engageSocialModal/EngageSocialModal"
import FormNavigationAlertModal from "./formNavigationAlertModal/FormNavigationAlertModal"
import InviteFriends from "./InviteFriends/InviteFriends"
import MissionsModal from "./missionsModal"
import MoveFileModal from "./moveFileModal"
import { PreReleaseMusicModal } from "./preReleaseMusic"
import PromoteCreateModal from "./promoteCreateModal"
import PromoteModal from "./promoteModal"
import { PublishUnpublishModal } from "./PublishUnpublsihModal/PublishUnpublishModal"
import PurchaseSubscriptionModal from "./PurchaseSubscription/PurchaseSubscriptionModal"
import SchedulePostModal from "./schedulePostModal"
import SelectFileModal from "./selectFileModal"
import { StreamingModal } from "./streamingModal"
import SubscriptionAlert from "./subscriptionAlertModal/SubscriptionAlertModal"
import SuccessModal from "./successModal"
import ViewLyricsModal from "./viewLyricsModal"

// import IpMetaDataModal from "./ipMetaDataModal/IpMetaDataModal"

function ModalWrapper() {
	const {
		user,
		userInfo,
		subscriptionFeatureAvailability,
		setIsFirstLogin,
		logout,
		isFirstLogin
	} = useUserStore()
	const { showCustomModal, customModalType } = useModalStore()
	const token = Cookies.get("accessToken") || null
	const pathname = usePathname()
	const { removeState, mediaPlayer } = useDynamicStore()

	const { data } = useQuery({
		queryKey: ["userData"],
		queryFn: () => {
			if (user?.id) {
				return fetchUserData(user.id)
			}
		},
		staleTime: 20000,
		enabled: !!user?.id && !!token
	})

	const { data: subscriptionFeatures } = useQuery({
		queryKey: ["subscriptionFeatureAvailability"],
		queryFn: () => fetchSubscriptionFeatureAvailability(),
		enabled: !!token
	})

	useEffect(() => {
		if (data) {
			userInfo(data)
			if (isFirstLogin !== false) {
				setIsFirstLogin(data?.firstTimeLogin)
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data])

	useEffect(() => {
		if (subscriptionFeatures) {
			subscriptionFeatureAvailability(subscriptionFeatures)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [subscriptionFeatures])

	useEffect(() => {
		if (pathname !== "/post-audio-or-video" && pathname !== "/library") {
			removeState("isShare")
			removeState("isReleaseVideo")
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pathname])

	useEffect(() => {
		if (!token && user) {
			logout()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user, token])

	return (
		<>
			<RecordingComplete />
			<ExistingProModal />
			<AddCollabModal />
			<MoveFileModal />
			<ConfirmationModal />
			<ReleaseModal />
			<SelectFileModal />
			<AddIpModal
				onBack={() => {
					showCustomModal({ customModalType: RELEASE_MODULE_MODAL })
				}}
			/>
			<PromoteModal />
			<PreReleaseMusicModal
				onBack={() => {
					showCustomModal({ customModalType: RELEASE_MODULE_MODAL })
				}}
			/>
			<PromoteCreateModal />
			{customModalType === ENGAGE_MODAL && <EngageModal />}
			<PostCommunityTopicModal />
			<InviteCollaboratorModal />
			<SchedulePostModal />
			<BuyNFTModal />
			<EngageSocialModal />
			<SuccessModal />
			<StreamingModal
				onBack={() => {
					showCustomModal({ customModalType: RELEASE_MODULE_MODAL })
				}}
			/>
			<SubscriptionAlert />
			<ComingSoonModal />
			<PurchaseSubscriptionModal />
			{mediaPlayer && <MediaPlayer />}
			{customModalType === AUDIO_VIDEO_MODAL && <AudioVideoModal />}
			<FormNavigationAlertModal />
			<ViewLyricsModal />
			{/* <IpMetaDataModal /> */}
			<InviteFriends />
			<MissionsModal />
			<CreateQuest />
			<PublishUnpublishModal />
		</>
	)
}

export default ModalWrapper
