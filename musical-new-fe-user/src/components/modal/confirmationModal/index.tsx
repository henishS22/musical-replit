import React from "react"

import { CONFIRMATION_MODAL } from "@/constant/modalType"
import {
	Button,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader
} from "@nextui-org/react"

import { useModalStore } from "@/stores"

import CustomModal from "../CustomModal"

export const ConfirmationModal = () => {
	const {
		hideCustomModal,
		customModalType,
		modalFunction,
		tempCustomModalData,
		isModalLoading
	} = useModalStore()

	const handleSubmit = () => {
		modalFunction()
	}
	return (
		<CustomModal
			onClose={hideCustomModal}
			showModal={customModalType === CONFIRMATION_MODAL}
			size="md"
		>
			<ModalContent>
				{(onClose) => (
					<>
						<ModalHeader className="flex flex-col gap-1">
							{tempCustomModalData?.title}
						</ModalHeader>
						<ModalBody>
							<p className={tempCustomModalData?.messageStyle}>
								{tempCustomModalData?.msg}
							</p>
						</ModalBody>
						{!tempCustomModalData?.hideFooter && (
							<ModalFooter>
								<Button color="danger" variant="light" onPress={onClose}>
									No
								</Button>
								<Button
									color="primary"
									isLoading={tempCustomModalData?.isLoading || isModalLoading}
									onPress={handleSubmit}
								>
									Yes
								</Button>
							</ModalFooter>
						)}
					</>
				)}
			</ModalContent>
		</CustomModal>
	)
}
