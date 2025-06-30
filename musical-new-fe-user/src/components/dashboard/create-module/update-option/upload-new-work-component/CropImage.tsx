"use client"

import React, { useState } from "react"
import Cropper from "react-easy-crop"

import { IMAGE_CROP_MODAL } from "@/constant/modalType"
import { getCroppedImg } from "@/helpers"
import {
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader
} from "@nextui-org/react"

import { useModalStore } from "@/stores"

interface CropImageProps {
	imageFile: File
	onSave: (croppedImage: File) => void
}

export function CropImage({ imageFile, onSave }: CropImageProps) {
	const [crop, setCrop] = useState({ x: 0, y: 0 })
	const [zoom, setZoom] = useState(1)
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [croppedArea, setCroppedArea] = useState<any>(null)

	const { customModalType, hideCustomModal } = useModalStore()
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleCropComplete = (_croppedArea: any, croppedAreaPixels: any) => {
		setCroppedArea(croppedAreaPixels)
	}

	const handleSave = async () => {
		const croppedBlob = await getCroppedImg(imageFile, croppedArea)
		if (croppedBlob) {
			const croppedFile = new File([croppedBlob], imageFile.name, {
				type: imageFile.type
			})
			onSave(croppedFile)
			hideCustomModal()
		}
	}

	const handleCancel = () => {
		hideCustomModal()
	}

	return (
		<Modal
			isOpen={customModalType === IMAGE_CROP_MODAL}
			onOpenChange={hideCustomModal}
			size="lg"
			classNames={{
				backdrop: "bg-[#F4F4F4]/90 z-60",
				wrapper: "z-60"
			}}
		>
			<ModalContent className="p-0 bg-white shadow-lg rounded-2xl overflow-hidden">
				<ModalHeader className="flex items-center p-4 border-b border-customGray">
					<div className="h-8 w-4 rounded bg-[#CABDFF] mr-4"></div>
					<h2 className="text-xl font-semibold tracking-tight text-textPrimary">
						Crop Image
					</h2>
				</ModalHeader>
				<ModalBody className="p-6">
					<div className="relative w-full h-[400px] rounded-lg overflow-hidden">
						<Cropper
							image={URL.createObjectURL(imageFile)}
							crop={crop}
							zoom={zoom}
							aspect={1}
							onCropChange={setCrop}
							onZoomChange={setZoom}
							onCropComplete={handleCropComplete}
						/>
					</div>
				</ModalBody>
				<ModalFooter className="flex justify-end gap-2 p-4 border-t border-customGray">
					<Button
						onPress={handleCancel}
						className="bg-[#F4F4F4] text-textPrimary font-medium py-2 px-4 rounded-lg"
					>
						Cancel
					</Button>
					<Button
						onPress={handleSave}
						className="bg-btnColor text-white font-medium py-2 px-4 rounded-lg"
					>
						Save
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	)
}
