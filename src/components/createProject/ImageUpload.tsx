import React, { useEffect, useState } from "react"
import { useDropzone } from "react-dropzone"
import Image from "next/image"

import { EDIT, REMOVE, UPLOAD } from "@/assets"
import { IMAGE_SIZE_ERROR, IMAGE_TYPE_ERROR } from "@/constant/errorMessage"
import { IMAGE_CROP_MODAL } from "@/constant/modalType"
import { ImageUploadProps } from "@/types"

import { useModalStore } from "@/stores"

import { ImageCropper } from "../dashboard/start-new-project/ImageCropper"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB in bytes

// Helper function to determine border color based on drag state
const getColor = (
	isDragAccept: boolean,
	isDragReject: boolean,
	isFocused: boolean
): string => {
	if (isDragAccept) {
		return "#00e676" // Green for accepted files
	}
	if (isDragReject) {
		return "#ff1744" // Red for rejected files
	}
	if (isFocused) {
		return "#2196f3" // Blue for focused state
	}
	return "#eeeeee" // Default gray
}

const ImageUpload: React.FC<ImageUploadProps> = ({
	onImageUpload,
	error,
	onRemove,
	artworkUrl,
	disabled = false,
	rawArtworkUrl
}) => {
	const [preview, setPreview] = useState<string>("")
	const [fileError, setFileError] = useState<string | null>(null)

	const [rawImage, setRawImage] = useState<File | null>(null)

	const [fetchArtworkUrl, setFetchArtworkUrl] = useState<boolean>(true)

	const { showCustomModal } = useModalStore()
	const {
		getRootProps,
		getInputProps,
		open,
		isFocused,
		isDragAccept,
		isDragReject
	} = useDropzone({
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
				setFileError(null)
				setRawImage(file)
				showCustomModal({ customModalType: IMAGE_CROP_MODAL }) // Open cropping modal
			}
		},
		onDropRejected: (fileRejections) => {
			if (fileRejections[0]?.errors[0]?.code === "file-too-large") {
				setFileError(IMAGE_SIZE_ERROR)
			}
			if (fileRejections[0]?.errors[0]?.code === "file-invalid-type") {
				setFileError(IMAGE_TYPE_ERROR)
			}
		},
		noClick: true // Prevent the file dialog from opening on click
	})

	const handleCropSave = (croppedImage: File) => {
		const file = URL.createObjectURL(croppedImage)
		setPreview(file) // Generate preview URL
		onImageUpload(croppedImage) // Pass file to parent handler
		setFileError(null) // Clear any previous errors
	}

	// Dynamically set the border color based on drag state
	const borderColor = getColor(isDragAccept, isDragReject, isFocused)

	useEffect(() => {
		if (!preview && fetchArtworkUrl && rawArtworkUrl && artworkUrl) {
			setFetchArtworkUrl(false)
			setPreview(artworkUrl)
			setRawImage(rawArtworkUrl as File)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [artworkUrl, rawArtworkUrl])

	return (
		<>
			{preview?.length > 0 ? (
				<div className="mt-4 relative w-[178px] group">
					<Image
						src={preview}
						alt="Preview"
						className="rounded-lg object-cover"
						width={178}
						height={178}
						unoptimized={true}
					/>
					{!disabled && (
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
									setPreview("")
									onRemove()
								}}
							/>
						</div>
					)}
				</div>
			) : (
				<div
					{...getRootProps()}
					className={`flex flex-col items-center justify-center w-full text-base font-bold tracking-normal leading-relaxed 
						bg-zinc-100 text-zinc-900 border-2 border-dashed rounded-lg outline-none transition-all 
						min-h-[200px] ${borderColor}`}
				>
					<input {...getInputProps()} />
					<button
						className="flex overflow-hidden gap-2 justify-center items-center px-5 py-3 rounded-xl border-2 border-solid shadow-lg bg-zinc-50 border-zinc-100"
						onClick={(e) => {
							e.stopPropagation() // Prevent event bubbling to the dropzone
							open()
						}}
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
					</button>
				</div>
			)}
			{(fileError || error) && (
				<p className="text-red-500 text-sm mt-2">{fileError || error}</p>
			)}
			{rawImage && (
				<ImageCropper imageFile={rawImage} onSave={handleCropSave} />
			)}
		</>
	)
}

export default ImageUpload
