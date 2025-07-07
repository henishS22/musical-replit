"use client"

import React, { useRef, useState } from "react"
import { toast } from "react-toastify"
import Image from "next/image"
import { useRouter } from "next/navigation"

import { updateCoverImage } from "@/app/api/mutation"
import { CAMERA_IMAGE, COVER_IMAGE, PROFILE_IMAGE } from "@/assets"
import { IMAGE_CROP_MODAL } from "@/constant/modalType"
import { Button } from "@nextui-org/react"
import { useMutation } from "@tanstack/react-query"

import { useDynamicStore, useModalStore, useUserStore } from "@/stores"

import { ImageCropper } from "../dashboard/start-new-project/ImageCropper"
import CollaborationTab from "./collaborationTab"
import ExchangeRequest from "./exchangeRequest"
import PlanTab from "./planTab"
import ProfileTab from "./profileTab"
import ProfileTabs from "./ProfileTabs"
import TokenTab from "./tokenTab"

const Profile: React.FC = () => {
	const router = useRouter()
	const { userData } = useUserStore()
	const { fromSubscription } = useDynamicStore()
	const [activeTab, setActiveTab] = useState(
		fromSubscription ? "Current Plan" : "My Profile"
	)
	const { showCustomModal } = useModalStore()

	const [coverImage, setCoverImage] = useState<string | null>(null)
	const [rawImage, setRawImage] = useState<File | null>(null)
	const fileInputRef = useRef<HTMLInputElement | null>(null)

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (file) {
			setRawImage(file)
			showCustomModal({ customModalType: IMAGE_CROP_MODAL })
		}
	}

	const { mutate } = useMutation({
		mutationFn: (payload: FormData) => updateCoverImage(payload),
		onSuccess: (data) => {
			if (data) {
				toast.success("Cover image updated successfully")
			}
		},
		onError: (error: Error) => {
			toast.error(error.message)
		}
	})

	const handleCropSave = (croppedImage: File) => {
		const formData = new FormData()
		formData.append("file", croppedImage)
		setCoverImage(URL.createObjectURL(croppedImage))
		mutate(formData)
	}

	const renderTabContent = () => {
		switch (activeTab) {
			case "My Profile":
				return <ProfileTab />
			case "Tokens":
				return <TokenTab />
			case "Collaboration":
				return <CollaborationTab />
			case "Exchange Request":
				return <ExchangeRequest />
			case "Current Plan":
				return <PlanTab />
			default:
				return null
		}
	}

	return (
		<div>
			<div className="relative w-full" style={{ aspectRatio: "1184 / 218" }}>
				<Image
					src={coverImage || userData?.cover_img || COVER_IMAGE}
					alt="cover"
					className="w-full h-full object-contain rounded-lg"
					fill
				/>

				<Image
					src={CAMERA_IMAGE}
					alt="camera"
					className="w-[48px] h-[48px] rounded-lg absolute bottom-[80px] right-[20px] cursor-pointer"
					width={48}
					height={48}
					onClick={() => fileInputRef.current?.click()}
				/>
			</div>
			<div className="flex flex-col bg-white rounded-xl max-md:px-5 w-[calc(100%-40px)] relative mx-auto mt-[-60px] p-6 pt-0">
				<div className="flex justify-between items-center min-h-[74px]">
					<div className="absolute top-[-96px] left-[23px]">
						<div className=" w-[198px] h-[198px]">
							<Image
								src={userData?.profile_img || PROFILE_IMAGE}
								className="object-contain shrink-0 self-stretch my-auto aspect-[1.09] w-[198px] rounded-full h-[198px] border-4 border-white outline outline-2 outline-gray-300"
								alt="profile"
								width={198}
								height={198}
							/>
						</div>
					</div>
					<div className="flex justify-end items-center font-manrope font-bold text-[32px] leading-[40px] tracking-[-0.03em] ml-[240px]">
						{userData?.name}
						{userData?.isGuildedProfileImage && (
							<img
								src="https://storage.googleapis.com/public-files-musical-dev-2/Guild%20Badge.svg"
								alt="Guilded Badge"
								style={{ width: 32, height: 32, marginLeft: 8, display: 'inline-block', verticalAlign: 'middle' }}
							/>
						)}
					</div>
					<span className="flex gap-2">
						<Button
							className="bg-videoBtnGreen text-[#1db954] "
							onPress={() => router.push(`/profile/${userData?._id}`)}
						>
							View Profile as Member
						</Button>

						<Button
							className="bg-btnColor hover:bg-btnColorHover text-white"
							onPress={() => router.push("/profile/edit")}
						>
							Edit
						</Button>
					</span>
				</div>
				<ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
				{renderTabContent()}
			</div>
			<input
				type="file"
				ref={fileInputRef}
				className="hidden"
				onChange={handleFileChange}
			/>
			{rawImage && (
				<ImageCropper
					imageFile={rawImage}
					onSave={handleCropSave}
					aspectRatio={1184 / 218}
				/>
			)}
		</div>
	)
}

export default Profile
