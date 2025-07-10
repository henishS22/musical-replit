import { ComingSoon } from "@/components/ui/commingSoon/commingSoon"
import { COMING_SOON_MODAL } from "@/constant/modalType"

import { useModalStore } from "@/stores"

import CustomModal from "../CustomModal"

const ComingSoonModal = () => {
	const { hideCustomModal, customModalType } = useModalStore()
	return (
		<CustomModal
			showModal={customModalType === COMING_SOON_MODAL}
			onClose={hideCustomModal}
			size="5xl"
			modalBodyClass="max-w-[540px] rounded-2xl"
		>
			<div className="p-6 rounded-2xl">
				<ComingSoon />
			</div>
		</CustomModal>
	)
}

export default ComingSoonModal
