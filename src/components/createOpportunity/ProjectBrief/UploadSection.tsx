import { memo } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

import { UPLOAD_ICON_2 } from "@/assets"
import { PROJECT_TRACKS_MODAL, SELECT_TRACK } from "@/constant/modalType"
import { Button } from "@nextui-org/react"
import { FileText } from "lucide-react"

import { useDynamicStore, useModalStore } from "@/stores"

interface UploadSectionProps {
	handleClick?: () => void
	showUpload?: boolean
	selectFromLibrary?: boolean
}

const UploadSection = ({
	handleClick,
	showUpload = true,
	selectFromLibrary = true
}: UploadSectionProps) => {
	const { showCustomModal, showCustomModal1 } = useModalStore()
	const router = useRouter()
	const { removeState } = useDynamicStore()
	return (
		<div className="border-1 border-dashed border-[#D6D6D6] rounded-lg p-6 bg-hoverGray">
			<div className="flex flex-col items-center gap-3">
				{showUpload && (
					<>
						<div className="flex flex-col items-center gap-2">
							<Button
								className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#1db954] text-[#1db954] bg-white"
								onPress={() => {
									if (handleClick) {
										handleClick()
									}

									removeState("linkTrack")
									removeState("trackFiles")
									router.push("/upload-new-work")
								}}
							>
								<span className="text-[13px] leading-[24px] tracking-[-0.015em] font-bold">
									Upload
								</span>
								<Image src={UPLOAD_ICON_2} alt="upload" />
							</Button>
						</div>
						<p className="text-center text-[14px] font-medium leading-[21px] tracking-[-0.015em]">
							Or
						</p>
					</>
				)}
				<Button
					className="flex items-center gap-2 px-4 py-2 rounded-xl border border-videoBtnGreen bg-white text-[#1db954]"
					onPress={() => {
						if (selectFromLibrary) {
							showCustomModal1({ customModalTypeOne: SELECT_TRACK })
						} else {
							showCustomModal({ customModalType: PROJECT_TRACKS_MODAL })
						}
					}}
				>
					<span className="text-[13px] leading-[24px] tracking-[-0.015em] font-bold">
						{selectFromLibrary ? "Select from library" : "Select from project"}
					</span>
					<FileText className="w-4 h-4" />
				</Button>
				<p className="text-textGray text-[10px] font-normal leading-[15px] tracking-[-0.015em] text-center">
					Link any songs or stems you would like applicants to hear. Viewers of
					this opportunity will be able to download these files.
				</p>
			</div>
		</div>
	)
}

export default memo(UploadSection)
