import React, { useEffect, useState } from "react"
import { toast } from "react-toastify"
import Image from "next/image"
import { useRouter } from "next/navigation"

import {
	ayrshareSocialLink,
	posttoSocialMedia,
	uploadMedia
} from "@/app/api/mutation"
import { ayrshareUserInfo } from "@/app/api/query"
import { POST_MODAL } from "@/constant/modalType"
import { convertAudioToVideo } from "@/helpers/audioToVideo"
import { createSocialMediaPayload } from "@/helpers/formatPayloadHelpers"
import { PostFormData } from "@/types/PromoteTypes"
import { Button, Skeleton } from "@nextui-org/react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Play } from "lucide-react"

import { socialPlatforms } from "@/config/postMedia"
import { useDynamicStore, useModalStore } from "@/stores"

import CustomModal from "./CustomModal"

interface PostModalProps {
	formData: PostFormData
}

const PostModal: React.FC<PostModalProps> = ({ formData }) => {
	const { hideCustomModal, customModalType } = useModalStore()
	const {
		trackId,
		schedulePostData,
		isReleaseVideo,
		addState,
		removeState,
		updateState
	} = useDynamicStore()
	const router = useRouter()
	const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [activeSocialAccounts, setActiveSocialAccounts] = useState<string[]>([])
	const [isConvertingtoVideo, setisConvertingtoVideo] = useState<boolean>(false)

	const { mutate: ayrshareJwt, isPending: ayrshareJwtLoading } = useMutation({
		mutationFn: ayrshareSocialLink,
		onSuccess: (data) => {
			if (data?.url) {
				window.open(data.url, "_blank")
			}
		}
	})

	const { data: ayrshareUserInfoData, isLoading: ayrshareUserInfoLoading } =
		useQuery({
			queryKey: ["ayrshareUserInfo"],
			queryFn: ayrshareUserInfo
		})

	useEffect(() => {
		if (ayrshareUserInfoData) {
			setActiveSocialAccounts(
				ayrshareUserInfoData?.profiles[0]?.activeSocialAccounts || []
			)
		}
	}, [ayrshareUserInfoData])

	const { mutate: uploadVideo, isPending: isUploading } = useMutation({
		mutationFn: (data: FormData) => uploadMedia(data),
		onError: () => {
			toast.error("Error posting to social media:")
		}
	})

	const { mutate: postToSocial, isPending } = useMutation({
		mutationFn: posttoSocialMedia,
		onSuccess: (data) => {
			if (data) {
				updateState("formNavigation", { isDirty: false })
				toast.success("Post to social media successful")
				hideCustomModal()
				addState("schedulePostData", {
					isSchedulePost: false,
					scheduleTime: null,
					scheduleDate: null
				})
				removeState("chips")
				removeState("isReleaseVideo")
				router.push("/dashboard")
			}
		},
		onError: (error) => {
			removeState("chips")
			console.error("Error posting to social media:", error)
		}
	})

	const handleSelection = (platformId: string) => {
		setSelectedPlatforms((prev) =>
			prev.includes(platformId)
				? prev.filter((id) => id !== platformId)
				: [...prev, platformId]
		)
	}

	const handlePost = async () => {
		if (!trackId) {
			toast.error("Please upload a media")
			return
		}

		try {
			let mediaUrl = trackId?.url || ""

			// Convert audio to video if needed
			if (trackId?.extension === "mp3" || trackId?.extension === "wav") {
				setisConvertingtoVideo(true)
				const videoBlob = await convertAudioToVideo(
					trackId.url,
					`${process.env.NEXT_PUBLIC_BASE_URL}/instrument/artwork.png`
				)
				setisConvertingtoVideo(false)
				const formData = new FormData()
				formData.append("file", videoBlob as Blob)

				const uploadResult = await new Promise<{ uri: string }>(
					(resolve, reject) => {
						uploadVideo(formData, {
							onSuccess: (data) => {
								if (!data) reject(new Error("No upload data received"))
								resolve(data as { uri: string })
							}
						})
					}
				)

				mediaUrl = uploadResult?.uri || mediaUrl
			}

			const payload = createSocialMediaPayload(
				formData,
				selectedPlatforms,
				mediaUrl,
				trackId,
				!!schedulePostData?.scheduleDate,
				schedulePostData?.scheduleTime,
				schedulePostData?.scheduleDate
			)
			postToSocial(payload)
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred"
			toast.error(`Failed to post: ${errorMessage}`)
			console.error("Error in handlePost:", error)
		}
	}

	const filteredPlatforms = isReleaseVideo
		? socialPlatforms?.filter((platform) => platform?.id === "youtube")
		: socialPlatforms

	return (
		<CustomModal
			showModal={customModalType === POST_MODAL}
			onClose={hideCustomModal}
			size="5xl"
			modalBodyClass="p-6 gap-4 bg-white shadow-lg w-[540px] max-h-screen rounded-2xl"
		>
			<div className="flex flex-col gap-[26px]">
				{/* Header */}
				<div className="text-[18px] font-bold leading-[24px] tracking-[-0.01em] text-textPrimary">
					Post Audio or Video
				</div>

				{/* Media Preview */}
				<div className="flex flex-col gap-4 px-4 py-2">
					<div className="flex items-center gap-3 p-3 border-2 border-hoverGray rounded-xl">
						{((trackId?.mediaType || trackId?.extension) === "mp4"
							? "video"
							: "audio") === "audio" ? (
							<>
								<div className="w-10 h-10 bg-gradient-to-b from-[#1DB653] to-[#0E5828] rounded-full flex items-center justify-center">
									<Play fill="white" color="white" />
								</div>
								<audio
									src={trackId?.file || trackId?.url}
									controls={false}
									className="hidden"
								/>
								<span className="text-sm font-medium text-[#0A1629]">
									{trackId?.name || "Media"}.mp3
								</span>
							</>
						) : (
							<div className="flex items-center gap-3 w-full">
								<div className="relative w-[120px] h-[100px] bg-black rounded-lg overflow-hidden">
									{(trackId?.file || trackId?.url) && (
										<video className="absolute inset-0 w-full h-full rounded-lg object-cover">
											<source
												src={trackId?.file || trackId?.url}
												type="video/mp4"
											/>
										</video>
									)}
									<div className="absolute inset-0 flex items-center justify-center">
										<span className="text-white">▶</span>
									</div>
								</div>
								<span className="text-sm font-medium text-[#0A1629]">
									{trackId?.name || "Media"}.mp4
								</span>
							</div>
						)}
					</div>

					{/* Post To Section */}
					<div className="flex flex-col gap-3">
						<div className="flex items-center justify-between">
							<span className="text-[18px] font-bold leading-[24px] tracking-[-0.01em] text-textPrimary">
								Post To:
							</span>
							<Button
								isLoading={ayrshareJwtLoading}
								type="button"
								onPress={() => {
									ayrshareJwt()
								}}
								className="px-4 py-2 gap-2 rounded-lg bg-[#DDF5E5] text-[#0D5326] font-bold "
							>
								Link Socials
							</Button>
						</div>

						<div className="flex flex-wrap gap-[20px]">
							{ayrshareUserInfoLoading
								? // Skeleton loaders
									filteredPlatforms.map((_, index) => (
										<Skeleton
											key={index}
											className="rounded-[4px] w-[44px] h-[44px]"
											disableAnimation={false}
										/>
									))
								: // Actual social platform icons
									filteredPlatforms.map((platform) => {
										const isConnected = activeSocialAccounts.includes(
											platform.id
										)

										return (
											<div
												key={platform.id}
												onClick={() =>
													isConnected && handleSelection(platform.id)
												}
												className={`relative cursor-pointer rounded-[4px] ${
													!isConnected ? "opacity-20 cursor-not-allowed" : ""
												}`}
											>
												<div
													className={`p-[1px] rounded-[4px] ${
														selectedPlatforms.includes(platform.id)
															? "bg-gradient-to-b from-[#1DB954] to-[#0D5326]"
															: "bg-transparent"
													}`}
												>
													<div className="p-1 bg-white rounded-[3px]">
														<Image
															src={platform.icon}
															alt={platform.name}
															width={42}
															height={42}
															className="object-contain rounded-[4px]"
														/>
													</div>
												</div>
											</div>
										)
									})}
						</div>
					</div>

					{/* Post Button */}
					<div className="flex justify-end mt-2">
						<Button
							type="button"
							onPress={handlePost}
							isDisabled={isPending || selectedPlatforms.length === 0}
							isLoading={isPending || isConvertingtoVideo || isUploading}
							className="min-w-fit max-w-[61px] px-4 py-2 gap-2 rounded-lg bg-gradient-to-b from-[#1DB653] to-[#0E5828] text-white text-[13px] font-bold leading-[24px]"
						>
							{isConvertingtoVideo
								? "Converting..."
								: isUploading
									? "Uploading..."
									: isPending
										? "Posting..."
										: "Post"}
						</Button>
					</div>
				</div>
			</div>
		</CustomModal>
	)
}

export default PostModal
