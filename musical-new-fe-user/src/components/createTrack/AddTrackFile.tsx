import { UPLOAD_TRACK_MODAL } from "@/constant/modalType"
import { Button } from "@nextui-org/react"

import { useModalStore } from "@/stores"

import UploadTrackModal from "../modal/UploadTrackModal"

const AddTrackFile = () => {
	const { showCustomModal } = useModalStore()
	// const { addState } = useDynamicStore()
	return (
		<div>
			<div>Add Track File</div>
			<Button
				variant="bordered"
				color="primary"
				className="w-full h-[42px]  rounded-md shadow-sm bg-white border-gray-300"
				onPress={() => {
					showCustomModal({ customModalType: UPLOAD_TRACK_MODAL })
					// addState("isReleaseTrack", true)
				}}
			>
				Add Track File
			</Button>
			<UploadTrackModal />
		</div>
	)
}

export default AddTrackFile
