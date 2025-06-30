"use client"

import { useRouter } from "next/navigation"

import { FORM_NAVIGATION_ALERT_MODAL } from "@/constant/modalType"
import { Button } from "@nextui-org/react"

import { useDynamicStore, useModalStore } from "@/stores"

import CustomModal from "../CustomModal"

const FormNavigationAlertModal = () => {
	const router = useRouter()
	const { customModalType, hideCustomModal } = useModalStore()
	const { formNavigation, updateState } = useDynamicStore()

	const handleStay = () => {
		updateState("formNavigation", {
			...formNavigation,
			pendingNavigation: null
		})
		hideCustomModal()
	}

	const handleLeave = () => {
		if (formNavigation?.pendingNavigation) {
			const destination = formNavigation.pendingNavigation
			updateState("formNavigation", {
				isDirty: false,
				pendingNavigation: null
			})
			hideCustomModal()
			setTimeout(() => {
				router.push(destination)
			}, 0)
		}
	}

	return (
		<CustomModal
			showModal={customModalType === FORM_NAVIGATION_ALERT_MODAL}
			onClose={handleStay}
			size="md"
			modalBodyClass="rounded-2xl"
		>
			<div className="p-6 rounded-2xl">
				<h2 className="text-xl font-semibold mb-4 text-textPrimary">
					Unsaved Changes
				</h2>
				<p className="mb-6 text-textPrimary text-center">
					You have unsaved changes. Are you sure you want to leave this page?
				</p>
				<div className="flex justify-center gap-3">
					<Button
						onPress={handleStay}
						className="bg-videoBtnGreen text-[#0D5326] px-4 py-2 rounded-lg text-[13px] leading-[24px] font-bold tracking-[-0.01em]"
					>
						Stay on Page
					</Button>
					<Button
						onPress={handleLeave}
						className="bg-btnColor text-white px-4 py-2 rounded-lg text-[13px] hover:bg-btnColorHover leading-[24px] font-bold tracking-[-0.01em]"
					>
						Leave Anyway
					</Button>
				</div>
			</div>
		</CustomModal>
	)
}

export default FormNavigationAlertModal
