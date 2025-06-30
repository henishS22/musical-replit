import React, { useState } from "react"
import { useDropzone } from "react-dropzone"
import Image from "next/image"

import { UPLOAD } from "@/assets"

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB in bytes

const FILE_SIZE_ERROR = "File size exceeds the 50MB limit."
const FILE_TYPE_ERROR =
	"Invalid file type. Please upload an audio or video file."

interface UploadProps {
	onUpload: (file: File) => void
	error?: string
	disabled?: boolean
}

const getColor = (
	isDragAccept: boolean,
	isDragReject: boolean,
	isFocused: boolean
) => {
	if (isDragAccept) return "#00e676"
	if (isDragReject) return "#ff1744"
	if (isFocused) return "#2196f3"
	return "#eeeeee"
}

const MediaUpload: React.FC<UploadProps> = ({
	onUpload,
	error,
	disabled = false
}) => {
	const [fileError, setFileError] = useState<string | null>(null)
	const [filePreview, setFilePreview] = useState<string | null>(null)

	const {
		getRootProps,
		getInputProps,
		open,
		isFocused,
		isDragAccept,
		isDragReject
	} = useDropzone({
		accept: {
			"audio/*": [],
			"video/*": []
		},
		maxFiles: 1,
		multiple: false,
		maxSize: MAX_FILE_SIZE,
		onDrop: (acceptedFiles) => {
			if (acceptedFiles.length > 0) {
				const file = acceptedFiles[0]
				setFileError(null)
				setFilePreview(URL.createObjectURL(file))
				onUpload(file)
			}
		},
		onDropRejected: (fileRejections) => {
			if (fileRejections[0]?.errors[0]?.code === "file-too-large") {
				setFileError(FILE_SIZE_ERROR)
			}
			if (fileRejections[0]?.errors[0]?.code === "file-invalid-type") {
				setFileError(FILE_TYPE_ERROR)
			}
		},
		noClick: true
	})

	const borderColor = getColor(isDragAccept, isDragReject, isFocused)

	return (
		<div
			{...getRootProps()}
			className={`flex flex-col items-center justify-center w-full text-base font-bold tracking-normal leading-relaxed bg-zinc-100 text-zinc-900 border-2 border-dashed rounded-lg outline-none transition-all min-h-[200px] ${borderColor}`}
		>
			<input {...getInputProps()} />
			<button
				className="flex overflow-hidden gap-2 justify-center items-center px-5 py-3 rounded-xl border-2 border-solid shadow-lg bg-zinc-50 border-zinc-100"
				onClick={(e) => {
					e.stopPropagation()
					open()
				}}
				type="button"
				tabIndex={0}
				disabled={disabled}
			>
				<Image
					loading="lazy"
					src={UPLOAD}
					alt="upload"
					className="object-contain"
					width={24}
					height={24}
				/>
				<div>Click or drop file</div>
			</button>
			{fileError || error ? (
				<p className="text-red-500 text-sm mt-2">{fileError || error}</p>
			) : null}
			{filePreview && (
				<div className="mt-4">
					{filePreview.includes("video") ? (
						<video src={filePreview} controls className="w-48 rounded-lg" />
					) : (
						<audio src={filePreview} controls className="w-48" />
					)}
				</div>
			)}
		</div>
	)
}

export default MediaUpload
