import React from "react"

import { ExistingProContent } from "@/components/dashboard/existingProContent"
import { TitleBadgeCard } from "@/components/ui"
import { EXISTINGPRO_MODAL } from "@/constant/modalType"
import { ModalContent } from "@nextui-org/react"

import { useDynamicStore, useModalStore } from "@/stores"

import CustomModal from "../CustomModal"

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface AddToProjectModalProps {}

// eslint-disable-next-line no-empty-pattern
export function ExistingProModal({}: AddToProjectModalProps): JSX.Element {
	const { hideCustomModal, customModalType } = useModalStore()
	const { removeState } = useDynamicStore()

	const handleClose = () => {
		hideCustomModal()
		removeState("projectIdFromDetails")
	}

	return (
		<CustomModal
			onClose={handleClose}
			showModal={customModalType === EXISTINGPRO_MODAL}
			size="lg"
		>
			<ModalContent className="p-0 bg-white shadow-lg w-[600px] rounded-2xl overflow-hidden">
				{/* Modal Header */}
				<TitleBadgeCard markColor="#CABDFF" title="Add To An Existing Project">
					{/* Modal Body */}

					<ExistingProContent inputLabel="Project Name" />
				</TitleBadgeCard>
			</ModalContent>
		</CustomModal>
	)
}
