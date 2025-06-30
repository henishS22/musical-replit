import React from "react"

import { SUBSCRIPTION_ALERT_MODAL } from "@/constant/modalType"
import { Button } from "@nextui-org/react"

import { useModalStore } from "@/stores"

import CustomModal from "../CustomModal"

const SubscriptionAlert = () => {
	const { hideCustomModal, customModalType, tempCustomModalData } =
		useModalStore()

	return (
		<CustomModal
			showModal={customModalType === SUBSCRIPTION_ALERT_MODAL}
			onClose={hideCustomModal}
			size="md"
			modalBodyClass="!max-w-[540px]"
		>
			<div className="p-6">
				<div className="flex flex-col items-center gap-6 px-4 py-2">
					<h3 className="text-xl text-textPrimary font-semibold leading-6 text-[#7D8592]">
						{tempCustomModalData?.title || "Subscription Alert"}
					</h3>
					<p className="text-center text-sm text-textGray">
						{tempCustomModalData?.message ||
							"Are you sure you want to proceed?"}
					</p>
					<div className="flex gap-4">
						<Button
							isLoading={tempCustomModalData?.isLoading}
							className="bg-btnColor text-white px-4 py-2 rounded-lg text-[13px] hover:bg-btnColorHover"
							onPress={() => {
								if (tempCustomModalData?.onConfirm) {
									tempCustomModalData.onConfirm()
								} else {
									hideCustomModal()
								}
							}}
						>
							{tempCustomModalData?.confirmButtonText || "Confirm"}
						</Button>
						<Button
							className="bg-videoBtnGreen text-[#0D5326] px-4 py-2 rounded-lg text-[13px] hover:bg-gray-400"
							onPress={hideCustomModal}
						>
							Cancel
						</Button>
					</div>
				</div>
			</div>
		</CustomModal>
	)
}

export default SubscriptionAlert
