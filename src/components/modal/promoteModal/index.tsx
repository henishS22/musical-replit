"use client"

import { useState } from "react"
import Image, { StaticImageData } from "next/image"

import CreateOptionsList from "@/components/createOption/createOption"
import CustomModal from "@/components/modal/CustomModal"
import { PROMOTE_MODULE_MODAL } from "@/constant/modalType"
import { usePromoteDropdown } from "@/helpers/dropdownOptions"
import { ModalContent } from "@nextui-org/react"

import { overviewData, promoteOptions } from "@/config"
import { useDynamicStore, useModalStore } from "@/stores"

import DigitalAdsModal from "../digitalAdsModal"
import GoViralModal from "../goViralModal"

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

export default function PromoteModal() {
	const { hideCustomModal, customModalType } = useModalStore()
	const [dropdownKey, setDropdownKey] = useState<string>("")
	const { addState } = useDynamicStore()

	const { handleDropdownOption } = usePromoteDropdown()

	const handleOptionSelect = (
		option: { type: string; value: string; title: string; description: string },
		modalType: string
	) => {
		handleDropdownOption(option, modalType, setDropdownKey)
	}

	return (
		<>
			<CustomModal
				onClose={hideCustomModal}
				showModal={customModalType === PROMOTE_MODULE_MODAL}
				size="5xl"
				backdropClass="bg-[#F4F4F4]/20 z-60"
			>
				<ModalContent className="p-0 gap-0 bg-white shadow-lg w-[1440px] h-[438px] rounded-2xl">
					<div className="flex items-center justify-between p-6 pt-8 pb-2">
						<h2 className="text-xl font-semibold flex items-center gap-2">
							<div
								className={`rounded-full p-4 mr-2 ${overviewData[2].bgColor} flex-shrink-0`}
							>
								<Image
									src={overviewData[2].icon}
									width={overviewData[2].iconWidth}
									height={overviewData[2].iconHeight}
									alt={overviewData[2].title}
								/>
							</div>
							Promote
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
							createOptions={promoteOptions}
							handleOptionSelect={handleOptionSelect}
						/>
					</div>
				</ModalContent>
			</CustomModal>
			<DigitalAdsModal initialDropdownKey={dropdownKey} />
			<GoViralModal initialDropdownKey={dropdownKey} />
		</>
	)
}
