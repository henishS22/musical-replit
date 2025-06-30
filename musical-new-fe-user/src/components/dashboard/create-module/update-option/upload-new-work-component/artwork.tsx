import React, { useState } from "react"
import { useDropzone } from "react-dropzone"
import Image from "next/image"

import { EDIT, REMOVE, UPLOAD } from "@/assets"
import { IMAGE_CROP_MODAL } from "@/constant/modalType"
import { ImageUploadProps } from "@/types"
import { Button } from "@nextui-org/react"

import { useModalStore } from "@/stores"

import { CropImage } from "./CropImage"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB in bytes

const ArtworkImageUpload: React.FC<ImageUploadProps> = ({
	onImageUpload,
	error,
	onRemove
}) => {
	const [preview, setPreview] = useState<string | null>(null)
	const [fileError, setFileError] = useState<string | null>(null)
	const [rawImage, setRawImage] = useState<File | null>(null)

	const { showCustomModal } = useModalStore()
	const { getRootProps, getInputProps, open } = useDropzone({
		accept: {
			"image/jpeg": [".jpeg", ".jpg"],
			"image/png": [".png"]
		},
		maxFiles: 1,
		multiple: false,
		maxSize: MAX_FILE_SIZE,
		onDrop: (acceptedFiles) => {
			if (acceptedFiles.length > 0) {
				const file = acceptedFiles[0]
				setRawImage(file)
				showCustomModal({ customModalType: IMAGE_CROP_MODAL }) // Open cropping modal
			}
		},
		onDropRejected: (fileRejections) => {
			if (fileRejections[0]?.errors[0]?.code === "file-too-large") {
				setFileError("File size must be less than 5MB")
			}
		}
	})

	const handleCropSave = (croppedImage: File) => {
		const file = URL.createObjectURL(croppedImage)
		setPreview(file) // Generate preview URL
		onImageUpload(croppedImage) // Pass file to parent handler
		setFileError(null) // Clear any previous errors
	}

	return (
		<>
			{preview ? (
				<div className="mt-4 relative w-[178px] group">
					<Image
						src={preview}
						alt="Preview"
						className="rounded-lg object-cover"
						width={178}
						height={178}
					/>
					<div className="flex items-center justify-center gap-4 absolute inset-0 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
						<Image
							src={EDIT}
							alt="Edit"
							className="rounded-lg object-cover cursor-pointer"
							width={36}
							height={36}
							onClick={() => {
								showCustomModal({ customModalType: IMAGE_CROP_MODAL })
							}}
						/>
						<Image
							src={REMOVE}
							alt="Remove"
							className="rounded-lg object-cover cursor-pointer"
							width={36}
							height={36}
							onClick={() => {
								setPreview(null)
								onRemove()
							}}
						/>
					</div>
				</div>
			) : (
				<div
					{...getRootProps()}
					className="flex flex-col items-center justify-center px-3 py-20 w-full text-base font-bold tracking-normal leading-relaxed rounded-xl bg-zinc-100 min-h-[200px] text-zinc-900"
				>
					<input {...getInputProps()} />

					<Button
						className="flex overflow-hidden gap-2 justify-center items-center px-5 py-3 rounded-xl border-2 border-solid shadow-lg bg-zinc-50 border-zinc-100"
						onPress={open}
						type="button"
						tabIndex={0}
					>
						<Image
							loading="lazy"
							src={UPLOAD}
							alt="upload"
							className="object-contain"
							width={24}
							height={24}
						/>
						<div>Click or drop image</div>
					</Button>
				</div>
			)}
			{(fileError || error) && (
				<p className="text-red-500 text-sm mt-2">{fileError || error}</p>
			)}
			{rawImage && <CropImage imageFile={rawImage} onSave={handleCropSave} />}
		</>
	)
}

export default ArtworkImageUpload
