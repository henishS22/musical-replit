"use client"

import { useState } from "react"
import useDrivePicker from "react-google-drive-picker"
import { toast } from "react-toastify"

import { FILE_FETCH_ERROR } from "@/constant/errorMessage"
import {
	allowedAudioMimetypesString,
	allowedProjectMimetypesString,
	allowedVideoMimetypesString
} from "@/constant/fileContants"
import { UploadNewFileProps } from "@/types/uploadTypes"
import { Button } from "@nextui-org/react"
import axios from "axios"
import { Upload } from "lucide-react"

import { useModalStore } from "@/stores"

export default function GoogleDrivePicker({
	onFileSelect
}: UploadNewFileProps) {
	const [openPicker, authResponse] = useDrivePicker()
	const { hideCustomModal } = useModalStore()

	const [uploadPercentage, setUploadPercentage] = useState<number>(0)

	const [selectedFile, setSelectedFile] = useState<{
		name: string
		id: string
		token: string
	} | null>(null)

	const [loader, setLoader] = useState<boolean>(false)

	const fetchBlobFromDrive = async (
		name: string,
		id: string,
		token: string
	) => {
		try {
			setLoader(true)
			const res = await axios({
				method: "GET",
				url: `https://www.googleapis.com/drive/v2/files/${id}?alt=media&source=downloadUrl&key=${process.env.NEXT_PUBLIC_GOOGLE_PICKER_API_KEY}`,
				headers: {
					Authorization: `Bearer ${token}`
				},
				responseType: "blob"
			})
			return res.data
		} catch {
			toast.error(FILE_FETCH_ERROR)
			return null
		} finally {
			setLoader(false)
		}
	}

	const handleOpenPicker = () => {
		openPicker({
			clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
			developerKey: process.env.NEXT_PUBLIC_GOOGLE_PICKER_API_KEY || "",
			viewId: "DOCS",
			viewMimeTypes: `${allowedAudioMimetypesString},${allowedVideoMimetypesString},${allowedProjectMimetypesString}`,
			supportDrives: true,
			multiselect: false,
			callbackFunction: (data) => {
				if (!data || data.action !== "picked") {
					return
				}

				if (!data.docs || data.docs.length === 0) {
					toast.error("No file selected. Please try again.")
					return
				}

				const selected = {
					name: data.docs[0].name,
					id: data.docs[0].id,
					token: authResponse?.access_token || ""
				}

				setSelectedFile(selected)
			}
		})
	}

	const handleRemoveFile = () => {
		setSelectedFile(null)
	}

	const updatePercentage = (percentage: number) => {
		setUploadPercentage(percentage)
	}

	const addTrackDetails = async () => {
		if (selectedFile) {
			const downloadedBlob = await fetchBlobFromDrive(
				selectedFile.name,
				selectedFile.id,
				selectedFile.token
			)

			// const blobUrl = URL.createObjectURL(downloadedBlob)
			const mediaFile = new File(
				[downloadedBlob],
				`filename.${downloadedBlob.type.split("/")[1]}`,
				{ type: downloadedBlob.type }
			)

			onFileSelect(mediaFile, setLoader, updatePercentage)
			hideCustomModal()
		}
	}

	return (
		<div className="w-full max-w-[500px] mx-auto bg-[#FCFCFC] rounded-xl mb-8 flex items-center justify-center">
			<div className="cursor-pointer w-full p-10">
				{selectedFile ? (
					<div className="flex flex-col gap-4">
						<div className="flex items-center justify-between border p-4 rounded-md">
							<span className="text-sm">{selectedFile.name}</span>
							<Button size="sm" variant="light" onPress={handleRemoveFile}>
								Remove
							</Button>
						</div>
						<Button
							color="primary"
							className="bg-btnColor text-white"
							fullWidth
							onPress={addTrackDetails}
							isLoading={loader}
						>
							{loader ? `${uploadPercentage}% Uploading...` : "Upload"}
						</Button>
					</div>
				) : (
					<div
						onClick={handleOpenPicker}
						className="flex flex-col items-center justify-center w-full text-base font-bold tracking-normal leading-relaxed 
        bg-zinc-100 text-zinc-900 border-2 border-dashed rounded-lg outline-none transition-all 
        min-h-[200px] border-gray-300 py-20 cursor-pointer"
					>
						<Upload className="w-10 h-10 mb-3 text-gray-700" />
						<p className="text-center text-gray-700">
							Click to select an audio file from Google Drive
						</p>
					</div>
				)}
			</div>
		</div>
	)
}
