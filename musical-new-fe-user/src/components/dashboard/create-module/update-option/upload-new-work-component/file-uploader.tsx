"use client"

import Image from "next/image"

import { LINK_ICON } from "@/assets"
import { Button, Progress } from "@nextui-org/react"

interface UploadProgressProps {
	fileName: string
	onClose?: () => void
	progress?: number
	status?: "idle" | "validating" | "uploading" | "success" | "error"
}

export function UploadProgress({
	fileName,
	onClose,
	status
}: UploadProgressProps) {
	const getStatusColor = () => {
		switch (status) {
			case "success":
				return "text-[#0A1629]"
			case "error":
				return "text-red-500"
			default:
				return "text-[#0A1629]"
		}
	}

	const getStatusText = () => {
		switch (status) {
			case "validating":
				return "Validating"
			case "uploading":
				return "Uploading"
			case "success":
				return "Upload Complete"
			case "error":
				return "Upload Failed"
			default:
				return "Uploading"
		}
	}

	return (
		<div className="w-full max-w-[500px] mx-auto bg-[#FCFCFC] rounded-xl p-6">
			<div className="flex flex-col items-center gap-6">
				{/* Icon Container */}
				<div className="relative">
					<div className="absolute inset-0 w-16 h-16 bg-white rounded-full shadow-sm -z-10" />
					<div className=" rounded-full bg-[#FFFFFF] flex items-center justify-center">
						<Image
							src={LINK_ICON}
							alt="Link Icon"
							width={80}
							height={80}
							className={`w-[80px] h-[80px] ${getStatusColor()}`}
						/>{" "}
					</div>
				</div>

				{/* Upload Status */}
				<div className="w-full text-center">
					<h3 className={`text-lg font-semibold mb-2 ${getStatusColor()}`}>
						{getStatusText()}
					</h3>
					<p className="text-sm text-gray-600 mb-4">{fileName}</p>

					{/* Progress Bar */}
					<div className="w-full max-w-md mx-auto">
						<Progress
							isIndeterminate
							aria-label="Loading..."
							className="max-w-md"
							size="sm"
						/>
						;
					</div>
				</div>

				{/* Optional close button */}
				{onClose && status !== "uploading" && (
					<Button
						onPress={onClose}
						className="text-sm text-gray-500 hover:text-gray-700"
					>
						{status === "error" ? "Try Again" : "Close"}
					</Button>
				)}
			</div>
		</div>
	)
}
