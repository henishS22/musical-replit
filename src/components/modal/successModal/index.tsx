import { toast, ToastOptions } from "react-toastify"
import Image from "next/image"

import { SUCCESS_ICON } from "@/assets"
import { SUCCESS_MODAL } from "@/constant/modalType"
import { Button } from "@nextui-org/react"

import { useModalStore } from "@/stores"

import CustomModal from "../CustomModal"

const SuccessModal = () => {
	const { hideCustomModal, customModalType, tempCustomModalData } =
		useModalStore()

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(tempCustomModalData?.url || "")
			toast.success("URL copied to clipboard!")
		} catch (error) {
			toast.error("Failed to copy URL", error as ToastOptions)
		}
	}

	return (
		<CustomModal
			showModal={customModalType === SUCCESS_MODAL}
			onClose={hideCustomModal}
			size="2xl"
			modalBodyClass="!max-w-[540px]"
		>
			<div className="p-6">
				{/* Success Icon */}
				<div className="flex flex-col items-center gap-6 px-4 py-2">
					<Image src={SUCCESS_ICON} alt="success" width={132} height={132} />

					{/* Heading */}
					<div className="text-center">
						<h3 className="text-[16px] font-medium leading-6 text-[#7D8592]">
							{tempCustomModalData?.heading || "Operation Successful"}
						</h3>
					</div>

					{/* URL Display Box */}
					{tempCustomModalData?.url && (
						<div className="flex items-center justify-between w-full py-3 px-2 bg-white border-2 border-[#E3E3E3] rounded-lg ">
							<span className="text-sm text-textGray truncate max-w-[400px]">
								{tempCustomModalData.url}
							</span>

							<Button
								className="px-5 gap-2 rounded-lg bg-[#DDF5E5] text-[#0D5326] font-bold text-[10px] leading-6"
								onPress={() => {
									handleCopy()
								}}
							>
								Copy
							</Button>
						</div>
					)}

					{/* Action Button */}
					<Button
						className="bg-btnColor text-white px-4 py-2 rounded-lg text-[13px] hover:bg-btnColorHover max-w-fit flex items-center justify-center"
						onPress={() => {
							if (tempCustomModalData?.onAction) {
								tempCustomModalData.onAction()
							}
							hideCustomModal()
						}}
					>
						{tempCustomModalData?.buttonText || "Done"}
					</Button>
				</div>
			</div>
		</CustomModal>
	)
}

export default SuccessModal
