import Image from "next/image"
import { useRouter } from "next/navigation"

import { REALEASE_ICON } from "@/assets"
import { EXISTINGPRO_MODAL } from "@/constant/modalType"
import { Button } from "@nextui-org/react"

import { useDynamicStore, useModalStore } from "@/stores"

function AddIpMetadata() {
	const { showCustomModal, hideCustomModal } = useModalStore()
	const router = useRouter()
	const { removeState, addState } = useDynamicStore()
	return (
		<div className="flex justify-center flex-col items-center p-6 gap-6">
			<div
				className={`w-16 h-16 rounded-full flex items-center justify-center bg-[#B1E5FC]`}
			>
				<Image src={REALEASE_ICON} alt="release" width={32} height={32} />
			</div>

			<div className="flex flex-col items-center text-center ">
				<h3
					className={`text-textGray text-[15px] font-[500] mb-1 leading-[24px] tracking-[-0.01em]`}
				>
					Select a Project:
				</h3>
				<p
					className={`text-textGray text-[15px] font-[500] leading-[24px] tracking-[-0.01em]`}
				>
					Choose an existing project or start a new one!
				</p>
			</div>

			<div className="flex gap-[20px] justify-center">
				<Button
					className={`bg-btnColor text-white px-4 py-2 rounded-lg text-[13px] hover:bg-btnColorHover`}
					onPress={() => {
						showCustomModal({
							customModalType: EXISTINGPRO_MODAL,
							tempCustomModalData: {
								handleNext: () => {
									router.push("/create-track")
									hideCustomModal()
								}
							}
						})
					}}
				>
					Add to an existing project
				</Button>

				<Button
					className={`font-bold rounded-md px-4 py-2 text-sm shadow transition-colors bg-videoBtnGreen text-[#0D5326]`}
					onPress={() => {
						removeState("collabData")
						removeState("trackId")
						addState("isReleaseTrack", true)
						hideCustomModal()
						router.push("/create-project")
					}}
				>
					Start a new project
				</Button>
			</div>
		</div>
	)
}

export default AddIpMetadata
