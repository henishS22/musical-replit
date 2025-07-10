import { SELECT_TRACK } from "@/constant/modalType"
import { fetchTrack } from "@/types/createOpportunityTypes"
import { ModalContent } from "@nextui-org/react"

import { useModalStore } from "@/stores"

import CustomModal from "../CustomModal"
import TrackSelectionContent from "./TrackSelectionContent"

const SelectTrackModal = ({
	onSubmit,
	initialData,
	singleSelect = false
}: {
	onSubmit?: (data: fetchTrack[]) => void
	initialData?: fetchTrack[]
	singleSelect?: boolean
}) => {
	const { customModalTypeOne, hideCustomModal1 } = useModalStore()

	return (
		<CustomModal
			onClose={hideCustomModal1}
			showModal={customModalTypeOne === SELECT_TRACK}
			size="3xl"
			backdropClass="bg-[#F4F4F4]/20 z-60"
		>
			<ModalContent className="p-0 bg-white shadow-lg max-w-[700px] rounded-2xl overflow-hidden">
				<TrackSelectionContent
					onSubmit={onSubmit}
					initialData={initialData}
					onClose={hideCustomModal1}
					singleSelect={singleSelect}
				/>
			</ModalContent>
		</CustomModal>
	)
}

export default SelectTrackModal
