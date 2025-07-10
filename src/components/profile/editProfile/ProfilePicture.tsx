"use client"

import React, { useState } from "react"
import { toast } from "react-toastify"
import Image from "next/image"

import { updateUser } from "@/app/api/mutation"
import { ImageCropper } from "@/components/dashboard/start-new-project/ImageCropper"
import { IMAGE_CROP_MODAL } from "@/constant/modalType"
import { Button } from "@nextui-org/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { PlusIcon } from "lucide-react"

import { useModalStore } from "@/stores/modal"

interface ProfilePictureProps {
	imageUrl: string
}
const ProfilePicture: React.FC<ProfilePictureProps> = ({ imageUrl }) => {
	const queryClient = useQueryClient()
	const fileInputRef = React.useRef<HTMLInputElement | null>(null)
	const { showCustomModal } = useModalStore()
	const [rawImage, setRawImage] = useState<File | null>(null)
	const [profileImage, setProfileImage] = useState<string | null>(null)
	const { mutate: updateUserMutation } = useMutation({
		mutationFn: (payload: { data: FormData; url: string }) =>
			updateUser(payload.data, payload.url),
		onSuccess: (data) => {
			if (data) {
				toast.success("Profile updated successfully")
				queryClient.invalidateQueries({ queryKey: ["userData"] })
			}
		},
		onError: () => {
			toast.error("Failed to update profile")
		}
	})

	const handleUpload = () => {
		fileInputRef.current?.click()
	}

	const handleRemove = () => {
		const formData = new FormData()
		formData.append("file", "")
		updateUserMutation({
			data: formData,
			url: "image/profile"
		})
		setProfileImage(null)
	}

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (file) {
			setRawImage(file)
			showCustomModal({ customModalType: IMAGE_CROP_MODAL })
		}
	}

	const handleCropSave = (croppedImage: File) => {
		const formData = new FormData()
		formData.append("file", croppedImage)
		setProfileImage(URL.createObjectURL(croppedImage))
		updateUserMutation({ data: formData, url: "image/profile" })
	}

	return (
		<div className="flex gap-8 my-8">
			<div className="overflow-hidden w-24 h-24 bg-red-300 rounded-[48px]">
				<Image
					src={profileImage || imageUrl}
					alt="Profile"
					className="object-cover size-full"
					width={96}
					height={96}
				/>
			</div>
			<div className="flex gap-3 items-center max-sm:flex-col max-sm:w-full">
				<Button
					onPress={handleUpload}
					className="flex gap-2 items-center px-5 py-3 text-base font-bold rounded-xl cursor-pointer border-[none] text-zinc-50 bg-btnColor"
					startContent={<PlusIcon className="w-4 h-4" />}
				>
					<span>Upload new picture</span>
				</Button>
				<Button
					onPress={handleRemove}
					className="px-5 py-3 text-base font-bold rounded-xl border-2 border-solid cursor-pointer bg-zinc-50 border-zinc-100 text-zinc-900 max-sm:w-full"
				>
					Remove
				</Button>
			</div>
			<input
				type="file"
				ref={fileInputRef}
				className="hidden"
				onChange={handleFileChange}
			/>
			{rawImage && (
				<ImageCropper imageFile={rawImage} onSave={handleCropSave} />
			)}
		</div>
	)
}

export default ProfilePicture
