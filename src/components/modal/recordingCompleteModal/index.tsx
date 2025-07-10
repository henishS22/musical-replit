import { FC } from "react"

import { ArtworkModal } from "@/components/dashboard/create-module/artwork-modal"
import { RECORDING_COMPLETE_MODAL } from "@/constant/modalType"

import { useDynamicStore, useModalStore } from "@/stores"

import CustomModal from "../CustomModal"

const RecordingComplete: FC = () => {
	const { hideCustomModal, customModalType } = useModalStore()
	const { videoUrl } = useDynamicStore()

	const hideModal = () => {
		hideCustomModal()
	}

	// const handleNavigation = (key: number) => {
	// 	return key
	// }

	return (
		<CustomModal
			onClose={hideModal}
			showModal={customModalType === RECORDING_COMPLETE_MODAL}
		>
			<ArtworkModal artworkUrl={videoUrl} />
		</CustomModal>
	)
}

export default RecordingComplete
