import React, { useState } from "react"

import SelectInput from "@/components/profile/editProfile/SelectInput"
import { UPLOAD_TRACK_MODAL } from "@/constant/modalType"
import { Button } from "@nextui-org/react"

import { useModalStore } from "@/stores"

const OPTIONS = {
	SELECT: "Select",
	UPLOAD_FILE: "Upload New File",
	DROPBOX: "Dropbox",
	GOOGLE_DRIVE: "Google Drive",
	PINATA: "Pinata (IPFS)"
}

const uploadOptions = [
	{ key: OPTIONS.UPLOAD_FILE, label: "Local File" },
	{ key: OPTIONS.DROPBOX, label: "Dropbox" },
	{ key: OPTIONS.GOOGLE_DRIVE, label: "Google Drive" },
	{ key: OPTIONS.PINATA, label: "Pinata (IPFS)" }
]

const UploadTrack: React.FC<{ className?: string; index?: number }> = ({
	className,
	index
}) => {
	const { showCustomModal } = useModalStore()

	const [selectedOption, setSelectedOption] = useState<string>(OPTIONS.SELECT)

	return (
		<div className={`flex w-full mb-10 gap-1 ${className}`}>
			<SelectInput
				placeholder="Select Source"
				options={uploadOptions}
				onChange={(value) => {
					setSelectedOption(value)
				}}
				value={selectedOption}
				className="w-full !max-w-full"
				classNames={{
					trigger: "bg-white border-2 border-[#DEDEDE] rounded-lg h-[48px]",
					listboxWrapper: "bg-white rounded-lg",
					item: "text-sm font-bold text-textPrimary hover:bg-hoverGray cursor-pointer",
					itemDescription: ""
				}}
			/>
			<Button
				isDisabled={
					selectedOption === OPTIONS.SELECT || selectedOption === undefined
				}
				onPress={() => {
					showCustomModal({
						customModalType: UPLOAD_TRACK_MODAL,
						tempCustomModalData: {
							modalType: selectedOption,
							index: index
						}
					})
				}}
				className="h-[48px] px-5 py-3 gap-2 rounded-lg bg-btnColor text-white font-bold"
			>
				Select
			</Button>
		</div>
	)
}

export default UploadTrack
