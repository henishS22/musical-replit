import { FC } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

import { LOGO } from "@/assets"
import { EMAIL_VERIFICATION_MODAL } from "@/constant/modalType"
import { Button } from "@nextui-org/react"

import { useModalStore } from "@/stores"

import CustomModal from "../CustomModal"

const EmailVerification: FC = () => {
	const { hideCustomModal, customModalType } = useModalStore()
	const router = useRouter()
	const hideModal = () => {
		hideCustomModal()
		router.push("/login")
	}

	return (
		<CustomModal
			onClose={hideModal}
			showModal={customModalType === EMAIL_VERIFICATION_MODAL}
		>
			<div className="bg-white p-6 flex flex-col items-center">
				<Image
					src={LOGO}
					alt="auth-bg"
					className="object-contain h-[100px]"
					loading="lazy"
					width={200}
					height={130}
				/>
				<div className="text-black text-center">
					We sent you a validation link, please check your email!
				</div>
				<Button
					className="w-full px-4 py-2 mt-5 text-white bg-blue-600 rounded-md hover:bg-blue-700"
					onPress={hideModal}
				>
					OK
				</Button>
			</div>
		</CustomModal>
	)
}

export default EmailVerification
