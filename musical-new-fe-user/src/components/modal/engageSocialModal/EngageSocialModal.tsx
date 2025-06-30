"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"

import { ARROWRIGHT_ICON, GREENCHECK_ICON } from "@/assets"
import {
	ENGAGE_SOCIAL_MEDIA_MODAL,
	PROMOTE_CREATE_MODAL
} from "@/constant/modalType"
import { Button } from "@nextui-org/react"

import { useDynamicStore } from "@/stores"
import { useModalStore } from "@/stores/modal"

import CustomModal from "../CustomModal"

interface EngageOption {
	title: string
	description: string
	onClick: () => void
}

export default function EngageSocialModal() {
	const { customModalType, hideCustomModal, showCustomModal } = useModalStore()
	const { addState } = useDynamicStore()
	const router = useRouter()

	const engageOptions: EngageOption[] = [
		{
			title: "Use Existing Content",
			description: "Upload content you gave & quickly post them",
			onClick: () => {
				router.push("/library")
				hideCustomModal()
			}
		},
		{
			title: "Create Something New",
			description: "Record something, leverage creative tools",
			onClick: () => {
				showCustomModal({
					customModalType: PROMOTE_CREATE_MODAL
				})
				addState("promoteFlow", "new_content")
			}
		},
		{
			title: "Schedule Posts",
			description: "Create a calendar of content to stay active",
			onClick: () => {
				router.push("/schedules")
				hideCustomModal()
			}
		}
	]

	return (
		<CustomModal
			showModal={customModalType === ENGAGE_SOCIAL_MEDIA_MODAL}
			onClose={hideCustomModal}
			title="Engage on Social Media"
			modalBodyClass="max-w-[540px]"
		>
			<div className="p-6">
				<p className="font-semibold text-base text-inputLabel mb-6">
					Post on Social Media
				</p>

				<div className="space-y-3">
					{engageOptions.map((option) => (
						<div
							key={option.title}
							className="border border-[#F4F4F4] rounded-lg group hover:bg-gray-50/75 transition-colors overflow-hidden"
						>
							<Button
								className="w-full h-auto min-h-0 font-normal bg-transparent hover:bg-transparent px-4 py-3"
								onPress={option.onClick}
							>
								<div className="flex items-center w-full">
									<div className="flex-shrink-0">
										<Image
											src={GREENCHECK_ICON}
											width={17}
											height={11}
											alt={option.title}
										/>
									</div>
									<div className="flex-1 min-w-0 px-3">
										<p className="text-[13px] text-textPrimary font-medium text-left truncate">
											{option.title}
										</p>
										<p className="text-[13px] text-textGray mt-0.5 text-left truncate tracking-tighter">
											{option.description}
										</p>
									</div>
									<Image
										src={ARROWRIGHT_ICON}
										width={6}
										height={4}
										alt="right"
										className="text-gray-400 group-hover:text-gray-600 flex-shrink-0"
									/>
								</div>
							</Button>
						</div>
					))}
				</div>
			</div>
		</CustomModal>
	)
}
