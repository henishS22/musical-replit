import React from "react"
import { useRouter } from "next/navigation"

import { EXISTINGPRO_MODAL } from "@/constant/modalType"
import { Button } from "@nextui-org/react"

import { useDynamicStore, useModalStore } from "@/stores"

const ProjectSelectionCard: React.FC = () => {
	const { showCustomModal, hideCustomModal } = useModalStore()
	const { removeState } = useDynamicStore()
	const router = useRouter()
	return (
		<div className="flex items-center justify-center">
			<div className="flex flex-col items-center justify-center p-8 w-full max-w-[492px]">
				<div className="text-[15px] text-textGray text-center leading-[24px] tracking-[-0.15px] mb-12 max-w-[315px]">
					Select a Project: Choose an existing project or start a new one
				</div>
				<div className="flex gap-4 w-full max-w-[346px]">
					<Button
						className="bg-btnColor text-white"
						onPress={() => {
							showCustomModal({
								customModalType: EXISTINGPRO_MODAL,
								tempCustomModalData: {
									handleNext: () => {
										router.push("/create-token")
										hideCustomModal()
									},
									showProjectTracks: true
								}
							})
						}}
					>
						Collaborate on existing
					</Button>
					<Button
						className="bg-[#DDF5E5] text-[#0D5326]"
						onPress={() => {
							hideCustomModal()
							removeState("collabData")
							removeState("trackId")
							router.push("/create-project")
						}}
					>
						Start a new project
					</Button>
				</div>
			</div>
		</div>
	)
}

export default ProjectSelectionCard
