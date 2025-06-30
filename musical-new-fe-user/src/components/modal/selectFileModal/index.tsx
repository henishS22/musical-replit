"use client"

import { useRouter } from "next/navigation"

import CustomModal from "@/components/modal/CustomModal"
import { SELECT_FILE_MODAL } from "@/constant/modalType"
import { Button, ModalBody, ModalContent, ModalHeader } from "@nextui-org/react"

import { useDynamicStore, useModalStore } from "@/stores"

export default function SelectFileModal() {
	const { hideCustomModal, customModalType } = useModalStore()
	const router = useRouter()
	const { addState, removeState } = useDynamicStore()

	const handleClick = (type: string) => {
		addState("schedulePostData", {
			isSchedulePost: true
		})
		hideCustomModal()
		if (type === "library") {
			router.push("/library")
		} else {
			removeState("linkTrack")
			removeState("isReleaseTrack")
			removeState("trackFiles")
			router.push("/upload-new-work")
		}
	}
	return (
		<CustomModal
			onClose={hideCustomModal}
			showModal={customModalType === SELECT_FILE_MODAL}
			size="sm"
			backdropClass="bg-[#F4F4F4]/20 z-60"
		>
			<ModalContent>
				<>
					<ModalHeader className="flex flex-col gap-1">
						Select a file
					</ModalHeader>
					<ModalBody className="flex gap-4 justify-center flex-row mb-10">
						<Button
							className="font-bold rounded-md px-5 py-3 text-[15px] shadow transition-colors text-white w-[110px]"
							style={{
								background:
									"linear-gradient(175.57deg, #1DB653 3.76%, #0E5828 96.59%)"
							}}
							onPress={() => {
								handleClick("library")
							}}
						>
							From Library
						</Button>
						<Button
							className="font-bold rounded-md px-5 py-3 text-[15px] shadow transition-colors w-[110px]"
							style={{
								background: "#DDF5E5",
								color: "#0D5326"
							}}
							onPress={() => {
								handleClick("create")
							}}
						>
							Create New
						</Button>
					</ModalBody>
				</>
			</ModalContent>
		</CustomModal>
	)
}
