import {
	INVITE_COLLABORATOR_MODAL,
	INVITE_FRIENDS_MODAL
} from "@/constant/modalType"
// import Savebtn from "@/components/ui/savebtn/savebtn"
import { Button } from "@nextui-org/react"

import { useModalStore } from "@/stores"

import CustomModal from "../CustomModal"

const InviteFriends = () => {
	const { hideCustomModal, customModalType, showCustomModal } = useModalStore()

	const handleInvite = (type: "sms" | "email") => {
		hideCustomModal()
		showCustomModal({
			customModalType: INVITE_COLLABORATOR_MODAL,
			tempCustomModalData: { initialKey: type }
		})
	}

	return (
		<CustomModal
			isBreadcrumb
			showModal={customModalType === INVITE_FRIENDS_MODAL}
			onClose={() => hideCustomModal()}
			title="Invite Friends"
			dropdownConfig={{
				isStatic: true,
				activeLabel: "Invite Friends",
				value: "Invite Friends",
				options: [],
				onChange: () => {}
			}}
		>
			<div className="flex justify-center flex-col items-center p-6 py-[82px] px-[29px] gap-6">
				<div className="flex flex-col items-center text-center ">
					<h3
						className={`text-textGray text-[15px] font-[500] mb-1 leading-[24px] tracking-[-0.01em]`}
					>
						Invite Friends:
					</h3>
					<p className="text-textGray text-[15px] font-[500] leading-[24px] tracking-[-0.01em]">
						Choose an option to invite
					</p>
				</div>

				<div className="flex gap-[20px] justify-center">
					<Button
						className={`bg-btnColor text-white px-4 py-2 rounded-lg text-[13px] hover:bg-btnColorHover`}
						onPress={() => handleInvite("sms")}
					>
						Invite by SMS
					</Button>

					<Button
						className={`font-bold rounded-md px-4 py-2 text-sm shadow transition-colors bg-videoBtnGreen text-[#0D5326]`}
						onPress={() => handleInvite("email")}
					>
						Invite by Email
					</Button>
				</div>
			</div>
		</CustomModal>
	)
}

export default InviteFriends
