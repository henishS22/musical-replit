"use client"

import React from "react"

import { getFileInfo, getMediaType } from "@/helpers"
import upload from "@/helpers/upload"
import { CollaboratorSectionProps } from "@/types"

import { useDynamicStore, useModalStore } from "@/stores"

import DropboxModal from "./dropbox-modal"
import GoogleDrivePicker from "./GoogleDrivePicker"
import PinataFilePicker from "./PinataFilePicker"
import { UploadNewFile } from "./UploadNewFile"

export function UploadOptionsModal({ setValue }: CollaboratorSectionProps) {
	const { tempCustomModalData } = useModalStore()
	const { addState } = useDynamicStore()
	let media: string
	const addMediaId = (id: string) => {
		addState("mediaId", id)
		media = id
	}

	const handleFileUpload = async (
		file: File,
		setLoader: (x: boolean) => void,
		updatePercentage: (percentage: number) => void
	) => {
		setValue("recordedFile", file)
		const fileType = getMediaType(file.name)
		const { size, extension, type } = await getFileInfo(file)
		addState("mediaExtension", extension)
		addState("mediaSize", size)
		await upload(
			file as File,
			setLoader,
			addMediaId,
			size,
			extension,
			type,
			updatePercentage
		)

		const mediaUrl = `${process.env.NEXT_PUBLIC_STORAGE_URL}/${media}.${extension}`

		// const fileURL = URL.createObjectURL(file)
		// let duration: number = 0

		// if (file.type.startsWith("audio/")) {
		// 	const audio = new Audio()

		// 	audio.preload = "metadata"
		// 	audio.src = mediaUrl

		// 	audio.onloadedmetadata = () => {
		// 		if (isFinite(audio.duration) && audio.duration > 0) {
		// 			duration = audio.duration
		// 		}
		// 	}
		// } else if (file.type.startsWith("video/")) {
		// 	const video = document.createElement("video")

		// 	video.preload = "metadata"
		// 	video.src = mediaUrl

		// 	video.onloadedmetadata = () => {
		// 		if (isFinite(video.duration) && video.duration > 0) {
		// 			duration = video.duration
		// 		}
		// 	}
		// }

		const trackInfo = {
			fileUrl: mediaUrl,
			duration: null,
			mediaType: fileType,
			uploadType: "file",
			fileName: file?.name,
			mediaExtension: extension,
			mediaSize: size,
			mediaId: media
		}

		// Get existing tracks array or initialize empty array
		const existingTracks = useDynamicStore.getState().trackFiles || []
		const updatedTracks = [trackInfo, ...existingTracks]

		addState("trackFiles", updatedTracks)
	}

	if (tempCustomModalData?.modalType === "Google Drive") {
		return <GoogleDrivePicker onFileSelect={handleFileUpload} />
	}

	if (tempCustomModalData?.modalType === "Dropbox") {
		return <DropboxModal onFileSelect={handleFileUpload} />
	}

	if (tempCustomModalData?.modalType === "Upload New File") {
		return <UploadNewFile onFileSelect={handleFileUpload} />
	}

	if (tempCustomModalData?.modalType === "Pinata (IPFS)") {
		return <PinataFilePicker onFileSelect={handleFileUpload} />
	}

	return null
}
