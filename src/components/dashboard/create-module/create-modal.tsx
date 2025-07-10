"use client"

import { useState } from "react"
import Image, { StaticImageData } from "next/image"

import CreateOptionsList from "@/components/createOption/createOption"
import CustomModal from "@/components/modal/CustomModal"
import WorkWithAiModal from "@/components/modal/WorkWithAiModal"
import { CREATE_MODULE_MODAL } from "@/constant/modalType"
import { useCreateDropdown } from "@/helpers/dropdownOptions"
import { ModalContent } from "@nextui-org/react"

import { createOptions, overviewData } from "@/config"
import { useDynamicStore, useModalStore } from "@/stores"

import { StartSoloModal } from "./startsolo-modal"

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

export function CreateModal() {
	const [selectedValue, setSelectedValue] = useState<string>("")
	const { showCustomModal, hideCustomModal, customModalType } = useModalStore()
	const { addState } = useDynamicStore()

	const { handleDropdownOption } = useCreateDropdown()

	const handleOptionSelect = (
		option: { type: string; value: string; title: string; description: string },
		modalType: string
	) => {
		handleDropdownOption(option, modalType, setSelectedValue)
	}

	return (
		<>
			<CustomModal
				onClose={hideCustomModal}
				showModal={customModalType === CREATE_MODULE_MODAL}
				size="5xl"
				backdropClass="bg-[#F4F4F4]/20 z-60"
			>
				<ModalContent className="p-0 gap-0 bg-white shadow-lg w-[1440px] h-[438px] rounded-2xl">
					<div className="flex items-center justify-between p-6 pt-8 pb-2">
						<h2 className="text-xl font-semibold flex items-center gap-2">
							<div
								className={`rounded-full p-4 mr-2 ${overviewData[0].bgColor} flex-shrink-0`}
							>
								<Image
									src={overviewData[0].icon}
									width={overviewData[0].iconWidth}
									height={overviewData[0].iconHeight}
									alt={overviewData[0].title}
								/>
							</div>
							Create
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
							createOptions={createOptions}
							handleOptionSelect={handleOptionSelect}
						/>
					</div>
				</ModalContent>
			</CustomModal>
			<StartSoloModal
				onBack={() => showCustomModal({ customModalType: CREATE_MODULE_MODAL })}
				initialKey={selectedValue}
			/>

			<WorkWithAiModal initialKey={selectedValue} />
		</>
	)
}
