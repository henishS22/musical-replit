"use client"

import CustomModal from "@/components/modal/CustomModal"
import { CREATE_MISSION_MODAL } from "@/constant/modalType"
import { MissionsPostMap } from "@/helpers/missionHelpers"

import { useDynamicStore, useModalStore } from "@/stores"

import { TwitterPostForm } from "./PostMissionForm"

export function CreateQuest() {
	const { hideCustomModal, customModalType, tempCustomModalData } =
		useModalStore()
	const { removeState } = useDynamicStore()

	const handleClose = () => {
		removeState("mentions")
		removeState("hashtags")
		hideCustomModal()
	}

	return (
		<CustomModal
			isBreadcrumb={true}
			onClose={handleClose}
			onBack={handleClose}
			size="5xl"
			modalBodyClass="max-w-[540px]"
			title="Missions"
			dropdownConfig={{
				isStatic: true,
				isStaticIcon: false,
				activeLabel: `Post and Mention on ${MissionsPostMap[tempCustomModalData?.identifier]}`,
				options: []
			}}
			showModal={customModalType === CREATE_MISSION_MODAL}
		>
			<section className="flex flex-col gap-7 items-start p-6 bg-white rounded-xl w-[540px] max-md:w-full max-sm:p-4">
				<TwitterPostForm />
			</section>
		</CustomModal>
	)
}
