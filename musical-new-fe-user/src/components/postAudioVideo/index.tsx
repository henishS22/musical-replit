"use client"

import { useEffect } from "react"
import { FormProvider, useForm } from "react-hook-form"
import Image from "next/image"
import { useRouter } from "next/navigation"

import { updateWithAi } from "@/app/api/mutation"
import { fetchTrackDetails } from "@/app/api/query"
import { MEDIA_PREVIEW, PROFILE_IMAGE, TRACK_THUMBNAIL } from "@/assets"
import PreviewCard from "@/components/createProject/PreviewCard"
import { TitleBadgeCard } from "@/components/ui"
import {
	AUDIO_VIDEO_MODAL,
	POST_MODAL,
	PURCHASE_SUBSCRIPTION_MODAL
} from "@/constant/modalType"
import { PostFormData } from "@/types/PromoteTypes"
import { postSchema } from "@/validationSchema/postToSocialSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@nextui-org/react"
import { useMutation, useQuery } from "@tanstack/react-query"

import { useDynamicStore, useModalStore, useUserStore } from "@/stores"
import { AudioFile } from "@/stores/dynamicStates"
import { useFormNavigationAlert } from "@/hooks/useFormNavigationAlert"

import PostModal from "../modal/PostModal"
import ArtworkSection from "./ArtworkSection"
import HashtagsSection from "./HashtagsSection"
import PostTextSection from "./PostTextSection"
import SuggestionButton from "./SuggestionButton"
import TrackNameSection from "./TrackSection"

export default function PostAudioVideo() {
	const router = useRouter()
	const { showCustomModal } = useModalStore()
	const { trackId, updateState } = useDynamicStore()
	const { userData, subscriptionFeatures } = useUserStore()
	const isSubscribed = subscriptionFeatures?.[5]?.available

	// Form setup
	const methods = useForm<PostFormData>({
		resolver: zodResolver(postSchema),
		defaultValues: {
			trackName: "",
			postText: "",
			trackfile: "",
			artwork: undefined,
			hashtags: []
		},
		mode: "onChange"
	})

	const {
		handleSubmit,
		watch,
		setValue,
		formState: { errors, isDirty }
	} = methods
	const postText = watch("postText")

	// Form Navigation Alert
	useFormNavigationAlert({ formState: { isDirty } })

	// AI Text Enhancement Mutation
	const {
		mutate: updateWithAIMutation,
		isPending: isAIUpdating,
		data: AIData
	} = useMutation({
		mutationFn: (text: string) => updateWithAi({ input_text: text }),
		onSuccess: (data) => {
			if (data) {
				setValue("postText", data?.enhanced_text, { shouldDirty: true })
			}
		}
	})

	// Track Details Query
	const { data: trackDetails } = useQuery({
		queryKey: ["trackDetails", trackId?._id || trackId?.id],
		queryFn: () => fetchTrackDetails(trackId?._id || (trackId?.id as string)),
		enabled: !!trackId?._id || !!trackId?.id
	})

	// Event Handlers
	const handleAiUpdate = () => {
		if (postText?.trim()) {
			updateWithAIMutation(postText)
		}
	}

	const onSubmit = () => {
		if (isSubscribed) {
			showCustomModal({ customModalType: POST_MODAL })
		} else {
			showCustomModal({ customModalType: PURCHASE_SUBSCRIPTION_MODAL })
		}
	}

	const showPreviewModal = () => {
		showCustomModal({ customModalType: AUDIO_VIDEO_MODAL })
	}

	useEffect(() => {
		if (trackDetails) {
			updateState("trackId", {
				url: trackDetails?.url,
				imageWaveSmall: trackDetails?.imageWaveSmall,
				artwork: trackDetails?.artwork,
				extension: trackDetails?.extension
			})
			setValue("artwork", trackDetails?.artwork as string)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [trackDetails])

	// Preview Component
	const PreviewComponent = () => (
		<div
			className="flex gap-2.5 items-start self-stretch w-10 rounded-[40px] cursor-pointer"
			onClick={showPreviewModal}
		>
			<Image
				loading="lazy"
				src={MEDIA_PREVIEW}
				alt="Preview controls"
				width={24}
				height={24}
				className="object-contain"
			/>
		</div>
	)

	return (
		<FormProvider {...methods}>
			<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
				<div className="flex justify-between items-center w-full">
					<h1 className="text-4xl font-semibold tracking-tighter leading-tight text-zinc-800">
						Post Audio or Video
					</h1>
				</div>

				<div className="flex flex-wrap gap-2 items-start mt-6 w-full">
					{/* Left Column */}
					<div className="flex flex-col flex-1 shrink basis-12 min-w-[240px]">
						<TitleBadgeCard
							markColor="#B5E4CA"
							title="Name"
							titleClassName="!mb-8"
						>
							<TrackNameSection />
							{errors.trackName && (
								<p className="text-red-500 text-sm mt-1">
									{errors.trackName.message}
								</p>
							)}
						</TitleBadgeCard>

						<TitleBadgeCard
							markColor="#B1E5FC"
							title="Artwork"
							titleClassName="!mb-8"
						>
							<ArtworkSection />
							{errors.artwork && (
								<p className="text-red-500 text-sm mt-1">
									{errors.artwork.message}
								</p>
							)}
						</TitleBadgeCard>

						<TitleBadgeCard
							markColor="#FFBC99"
							title="Post Text"
							titleClassName="!mb-8"
							subComponent={
								<div className="flex gap-2">
									<SuggestionButton
										text={isAIUpdating ? "Updating..." : "Update with AI"}
										onClick={handleAiUpdate}
										isDisabled={
											!postText?.trim() ||
											isAIUpdating ||
											(!isSubscribed as boolean)
										}
										isLoading={isAIUpdating}
										primaryBtn
									/>
								</div>
							}
						>
							<PostTextSection />
							{errors.postText && (
								<p className="text-red-500 text-sm mt-1">
									{errors.postText.message}
								</p>
							)}
						</TitleBadgeCard>

						<TitleBadgeCard
							markColor="#CABDFF"
							title="Add Hashtags"
							titleClassName="!mb-8"
						>
							<HashtagsSection suggestedHashtags={AIData?.hashtags || []} />
						</TitleBadgeCard>
					</div>

					{/* Right Column - Preview */}
					<div className="flex overflow-hidden flex-col rounded-lg bg-zinc-50 min-w-[240px] w-[340px]">
						<TitleBadgeCard
							markColor="#B1E5FC"
							title="Preview"
							subComponent={<PreviewComponent />}
						>
							<PreviewCard
								artworkSrc={trackId?.artwork || TRACK_THUMBNAIL}
								title={trackId?.name}
								duration={
									(trackId as AudioFile)?.duration ||
									(trackId as AudioFile)?.durationInMinutes ||
									0
								}
								avatarSrc={userData?.profile_img || PROFILE_IMAGE}
								artistName={userData?.name || ""}
							/>
						</TitleBadgeCard>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex justify-end mt-6 gap-4">
					<Button
						type="button"
						onPress={() => router.back()}
						className="w-[92px] h-[48px] px-5 py-3 gap-2 rounded-lg bg-[#DDF5E5] text-[#0D5326] font-bold"
					>
						Back
					</Button>
					<Button
						type="submit"
						className="w-[92px] h-[48px] px-5 py-3 gap-2 rounded-lg bg-btnColor text-white font-bold"
					>
						Next
					</Button>
				</div>

				{/* Modals */}

				<PostModal formData={methods.getValues()} />
			</form>
		</FormProvider>
	)
}
