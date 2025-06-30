"use client"

import { forwardRef, useEffect, useImperativeHandle, useState } from "react"
import { toast } from "react-toastify"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"

import { addTracksToProject, createTrack } from "@/app/api/mutation"
import { AUDIO_ICON, DOWNLOAD_ICON, PLAY_ICON } from "@/assets"
import SelectableOptions from "@/components/createOpportunity/ProjectNeeds/SelectableOptions"
import { ActionButtons } from "@/components/ui/actionButton/ActionButton"
import Loader from "@/components/ui/loader/loader"
import { Waveform } from "@/components/waveform/Waveform"
import { EXISTINGPRO_MODAL } from "@/constant/modalType"
import { TRACK_ADDED_TO_PROJECT_SUCCESSFULLY } from "@/constant/toastMessages"
import {
	generateUniqueFilename,
	generateWaveformImage,
	getFileInfo
} from "@/helpers"
import { resetModalSteps } from "@/helpers/modalStepHelpers"
import upload from "@/helpers/upload"
import { Language } from "@/types/createOpportunityTypes"
import { ImageData } from "@/types/uploadTypes"
import { Button } from "@nextui-org/react"
import { useMutation } from "@tanstack/react-query"
import { Play, Volume2, VolumeX } from "lucide-react"

import { useLibraryStore, useModalStore } from "@/stores"
import { useDynamicStore } from "@/stores/dynamicStates"

interface RecordingModalProps {
	audioUrl: string | undefined
	handleNavigation?: (state: number) => void
	audioFile: Blob | undefined
	melody?: boolean
	enhaceText?: string
	handleEnhance?: () => void
	isPromoteFlow?: boolean
	onExistingProject?: () => void
	onNewProject?: () => void
	onSocialPost?: () => void
	handleSubmit?: () => void
	isLoading?: boolean
	overlayModal?: boolean
	isEnhanceLoading?: boolean
	createTrackFromAi?: boolean
}

export const RecordingModal = forwardRef(function RecordingModal(
	{
		audioUrl,
		handleNavigation,
		audioFile,
		melody = false,
		enhaceText = "Enhance Audio with AI",
		handleEnhance,
		isPromoteFlow = false,
		onExistingProject,
		onNewProject,
		onSocialPost,
		handleSubmit,
		isLoading,
		overlayModal = false,
		isEnhanceLoading,
		createTrackFromAi = false
	}: RecordingModalProps,
	ref
) {
	const { addState, recordingData, updateState, removeState, trackId } =
		useDynamicStore()
	const { id } = useParams()
	const { instruments } = useLibraryStore()
	const { showCustomModal, hideCustomModal } = useModalStore()
	const router = useRouter()
	const [isPlaying, setIsPlaying] = useState(false)
	const [duration, setDuration] = useState<number>(0)
	const [showActionButtons, setShowActionButtons] = useState(false)
	const [smallWaveImage, setSmallWaveImage] = useState<ImageData | undefined>(
		undefined
	)
	const [isMuted, setIsMuted] = useState(false)
	const [loader, setLoader] = useState<boolean>(false)

	const { mutate: createTrackMutation, isPending: createTrackLoading } =
		useMutation({
			mutationFn: (payload: FormData) => createTrack(payload),
			onSuccess: (data) => {
				if (data) {
					addState("trackId", {
						file: audioUrl,
						duration: Number(duration),
						id: data._id,
						mediaType: "audio",
						name: data?.name
					})
					if (!melody && handleNavigation) {
						handleNavigation(3)
					} else {
						setShowActionButtons(true)
					}
				}
			},
			onError: (error: Error) => {
				toast.error("Failed to create track: " + error.message)
			}
		})

	const { mutate: addTracksToProjectMutation, isPending } = useMutation({
		mutationFn: (payload: { projectId: string; trackIds: string[] }) =>
			addTracksToProject(payload),
		onSuccess: (data) => {
			if (data) {
				toast.success(TRACK_ADDED_TO_PROJECT_SUCCESSFULLY)
				hideCustomModal()
				removeState("trackId")
			}
		}
	})

	useEffect(() => {
		if (audioUrl) {
			handleGenerateWaveformImage(audioUrl)
		}
	}, [audioUrl])

	const handleGenerateWaveformImage = async (url: string) => {
		const smallWaveImage = await generateWaveformImage({
			audioUrl: url,
			resolution: 512
		})
		setSmallWaveImage({
			dataUrl: smallWaveImage.dataUrl,
			blob: smallWaveImage.blob
		})
	}

	useImperativeHandle(
		ref,
		() => ({
			createTrack: createTrackMutation
		}),
		[createTrackMutation]
	)

	let mediaId: string

	const addMediaId = (id: string) => {
		mediaId = id
	}

	const handleNext = async () => {
		const payload = new FormData()
		const uniqueName = generateUniqueFilename()
		payload.append("name", uniqueName)
		if (smallWaveImage?.blob)
			payload.append("imageWaveSmall", smallWaveImage?.blob)
		if (createTrackFromAi) {
			payload.append("isAIGenerated", "true")
		}
		if (audioFile) {
			const { size, extension, type } = await getFileInfo(audioFile as File)
			await upload(
				audioFile as File,
				setLoader,
				addMediaId,
				size,
				extension,
				type
			)
			payload.append("_id", mediaId)
			payload.append(
				"url",
				`${process.env.NEXT_PUBLIC_STORAGE_URL}/${mediaId}.${extension}`
			)

			payload.append("fileSize", size.toString())
			payload.append("extension", extension)
			// payload.append("file", audioFile)
		}
		createTrackMutation(payload)
	}

	const handleSelectionChange = (value: Language) => {
		const currentSelection = recordingData?.instruments || []

		// If value is already selected, deselect it, otherwise set it as the only selection
		const newSelection = currentSelection?.includes(value._id) ? [] : [value]

		updateState("recordingData", {
			...recordingData,
			instruments: newSelection
		})
	}

	return (
		<div className="w-full max-w-[500px] mx-auto bg-white">
			<div className="bg-[#FCFCFC] rounded-xl p-6">
				<div className="flex items-center gap-2 mb-2">
					<Image src={AUDIO_ICON} alt="Audio Icon" className="w-5 h-5" />
					<span className="text-[#33383F] font-medium">Audio File</span>
				</div>

				<div className="bg-white rounded-xl p-2 border-2 border-[#F4F4F4] w-460">
					{audioUrl && (
						<>
							<div className="flex items-center gap-4">
								<Button
									isIconOnly
									variant="light"
									className="min-w-0 h-10 w-10 p-0 relative"
									onPress={() => setIsPlaying((prev) => !prev)}
								>
									<div className="absolute inset-0 flex items-center justify-center">
										{!isPlaying ? (
											<Play className="h-6 w-6 text-white object-cover bg-black rounded-lg" />
										) : (
											<Image
												src={PLAY_ICON}
												alt="Pause Icon"
												className="object-cover"
												height={50}
												width={50}
											/>
										)}
									</div>
								</Button>

								<Button
									isIconOnly
									variant="light"
									className="min-w-0 h-10 w-10 p-0 relative"
									onPress={() => setIsMuted((prev) => !prev)}
								>
									<div className="absolute inset-0 flex items-center justify-center">
										{!isMuted ? <Volume2 /> : <VolumeX />}
									</div>
								</Button>

								<Waveform
									isMuted={isMuted}
									audioUrl={audioUrl}
									isPlaying={isPlaying}
									onPlay={() => setIsPlaying(true)}
									onPause={() => setIsPlaying(false)}
									onDuration={setDuration}
								/>

								<Button
									isIconOnly
									variant="light"
									className="min-w-0 w-8 h-8 text-textGray"
									onPress={() => {
										if (audioUrl) {
											const a = document.createElement("a")
											a.href = audioUrl
											a.download = "recording.wav"
											a.click()
										}
									}}
								>
									<Image
										src={DOWNLOAD_ICON}
										alt="Download"
										width={16}
										height={16}
									/>
								</Button>
							</div>
						</>
					)}
				</div>
				{melody &&
					(!isPromoteFlow ? (
						!showActionButtons ? (
							<SelectableOptions
								classNames={{
									base: "!h-[117px] overflow-y-auto scrollbar"
								}}
								data={instruments || []}
								selectedItems={
									recordingData?.instruments?.map(
										(item: Language) => item._id
									) || []
								}
								onItemChange={(value) =>
									handleSelectionChange(value as Language)
								}
								label="Add Instruments to enhance your music"
								customFilterLabel
								sendWholeItem
								icon
							/>
						) : (
							<div className="mt-[26px]">
								{!id ? (
									<ActionButtons
										onExistingProject={() => {
											hideCustomModal()
											resetModalSteps()
											showCustomModal({
												customModalType: EXISTINGPRO_MODAL,
												tempCustomModalData: {
													startSolo: true
												}
											})
										}}
										onNewProject={() => {
											router.push("/create-project")
											resetModalSteps()
											hideCustomModal()
										}}
										onSocialPost={() => {
											removeState("chips")
											router.push("/post-audio-or-video")
											hideCustomModal()
											resetModalSteps()
										}}
									/>
								) : (
									<div className="flex flex-col w-full items-center justify-center">
										<Button
											className="bg-btnColor text-white px-4 py-2 rounded-lg text-[13px] w-full max-w-[352px] hover:bg-btnColorHover"
											isLoading={isPending}
											onPress={() => {
												addTracksToProjectMutation({
													projectId: id as string,
													trackIds: [trackId?.id as string]
												})
											}}
										>
											Save
										</Button>
										<Button
											className="w-full max-w-[352px] mt-4 border border-[#DDF5E5] bg-transparent text-[#0D5326] font-bold rounded-md py-3 text-sm hover:bg-[#F4F4F4] transition-colors"
											onPress={() => {
												hideCustomModal()
												removeState("chips")
												router.push("/post-audio-or-video")
											}}
										>
											Post to Social
										</Button>
									</div>
								)}
							</div>
						)
					) : !id ? (
						<div className="mt-[26px]">
							<ActionButtons
								onExistingProject={() => {
									onExistingProject?.()
								}}
								onNewProject={() => {
									onNewProject?.()
								}}
								onSocialPost={() => {
									onSocialPost?.()
								}}
							/>
						</div>
					) : (
						<div className="flex flex-col w-full items-center justify-center mt-[26px]">
							<Button
								className="bg-btnColor text-white px-4 py-2 rounded-lg text-[13px] w-full max-w-[352px] hover:bg-btnColorHover"
								isLoading={isPending}
								onPress={() => {
									addTracksToProjectMutation({
										projectId: id as string,
										trackIds: [trackId?.id as string]
									})
								}}
							>
								Save
							</Button>
							<Button
								className="w-full max-w-[352px] mt-4 border border-[#DDF5E5] bg-transparent text-[#0D5326] font-bold rounded-md py-3 text-sm hover:bg-[#F4F4F4] transition-colors"
								onPress={() => {
									hideCustomModal()
									removeState("chips")
									router.push("/post-audio-or-video")
								}}
							>
								Post to Social
							</Button>
						</div>
					))}

				{!showActionButtons && !isPromoteFlow && (
					<div className="flex justify-center mt-10 gap-3">
						{handleEnhance && (
							<div className="flex justify-center">
								<Button
									isLoading={isEnhanceLoading}
									onPress={handleEnhance}
									className="bg-btnColor text-white min-w-[10px] rounded-lg font-medium"
								>
									{enhaceText || "Enhance Audio with AI"}
								</Button>
							</div>
						)}

						<div className="flex justify-center">
							<Button
								onPress={!handleSubmit ? handleNext : handleSubmit}
								className="bg-btnColor text-white min-w-[10px] rounded-lg font-medium"
							>
								{createTrackLoading || isLoading || loader
									? !melody
										? "Uploading..."
										: "Generating..."
									: !melody
										? "Next"
										: "Generate"}
							</Button>
						</div>
					</div>
				)}
			</div>
			{overlayModal && (
				<Loader
					isOpen={createTrackLoading || isLoading || false}
					type="waveform"
				/>
			)}
		</div>
	)
})
