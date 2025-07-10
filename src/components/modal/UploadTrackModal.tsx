import { FC } from "react"

import { UPLOAD_TRACK_MODAL } from "@/constant/modalType"

import { useDynamicStore, useModalStore } from "@/stores"

import UploadSection from "../createOpportunity/ProjectBrief/UploadSection"
import CustomModal from "./CustomModal"

const UploadTrackModal: FC = () => {
	const { hideCustomModal, customModalType } = useModalStore()
	const { removeState, addState } = useDynamicStore()
	return (
		<CustomModal
			onClose={hideCustomModal}
			showModal={customModalType === UPLOAD_TRACK_MODAL}
			className="max-w-[600px]"
		>
			<div className="bg-white p-6">
				<h2 className="text-xl font-semibold mb-4">Upload Track</h2>
				<UploadSection
					selectFromLibrary={false}
					handleClick={() => {
						hideCustomModal()
						removeState("opportunity")
						addState("isReleaseTrack", true)
					}}
				/>
			</div>
		</CustomModal>
	)
}

export default UploadTrackModal
