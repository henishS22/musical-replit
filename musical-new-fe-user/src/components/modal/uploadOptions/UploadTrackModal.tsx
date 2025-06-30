"use client"

import CustomModal from "@/components/modal/CustomModal"
import { UPLOAD_TRACK_MODAL } from "@/constant/modalType"
import { CollaboratorSectionProps } from "@/types"

import { useModalStore } from "@/stores"

import { UploadOptionsModal } from "./upload-options-modal"

function UploadTrackModal({ setValue }: CollaboratorSectionProps) {
	const { hideCustomModal, customModalType } = useModalStore()

	return (
		<CustomModal
			onClose={hideCustomModal}
			size="xl"
			showModal={customModalType === UPLOAD_TRACK_MODAL}
			isBreadcrumb={true}
			modalBodyClass="max-w-[540px]"
			title="Upload Track"
			onBack={hideCustomModal}
		>
			<UploadOptionsModal setValue={setValue} />
		</CustomModal>
	)
}

export default UploadTrackModal
