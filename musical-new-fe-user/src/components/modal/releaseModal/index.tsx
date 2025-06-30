"use client"

import Image, { StaticImageData } from "next/image"

import CreateOptionsList from "@/components/createOption/createOption"
import CustomModal from "@/components/modal/CustomModal"
import { RELEASE_MODULE_MODAL } from "@/constant/modalType"
import { useReleaseDropdown } from "@/helpers/dropdownOptions"
import { ModalContent } from "@nextui-org/react"

import { overviewData, releaseOptions } from "@/config"
import { useDynamicStore, useModalStore } from "@/stores"

export interface CreateOption {
	title: string
	icon: StaticImageData
	options: {
		title: string
		value: string
		type: string
		description: string
	}[]
}

export default function ReleaseModal() {
	const { hideCustomModal, customModalType } = useModalStore()
	const { handleDropdownOption } = useReleaseDropdown()
	const { addState } = useDynamicStore()

	const handleOptionSelect = (
		option: { type: string; value: string; title: string; description: string },
		modalType: string
	) => {
		handleDropdownOption(option, modalType)
	}

	return (
		<CustomModal
			onClose={hideCustomModal}
			showModal={customModalType === RELEASE_MODULE_MODAL}
			size="5xl"
			backdropClass="bg-[#F4F4F4]/20 z-60"
		>
			<ModalContent className="p-0 gap-0 bg-white shadow-lg w-[1440px] h-[438px] rounded-2xl">
				<div className="flex items-center justify-between p-6 pt-8 pb-2">
					<h2 className="text-xl font-semibold flex items-center gap-2">
						<div
							className={`rounded-full p-4 mr-2 ${overviewData[1].bgColor} flex-shrink-0`}
						>
							<Image
								src={overviewData[1].icon}
								width={overviewData[1].iconWidth}
								height={overviewData[1].iconHeight}
								alt={overviewData[1].title}
							/>
						</div>
						Release
					</h2>
					<span className="text-sm text-textGray font-semibold flex items-center gap-1">
						Select Path below or
						<span
							className="text-white cursor-pointer font-normal bg-gradient-to-br from-gray-700 via-green-700 to-blue-700 px-2 py-1 rounded-md"
							onClick={() => {
								hideCustomModal()
								addState("ChatPop", {
									open: true,
									key: "ai"
								})
							}}
						>
							Ask Piper AI
						</span>
					</span>
				</div>
				<div className="grid grid-cols-3 gap-6 p-6">
					<CreateOptionsList
						createOptions={releaseOptions}
						handleOptionSelect={handleOptionSelect}
					/>
				</div>
			</ModalContent>
		</CustomModal>
	)
}
