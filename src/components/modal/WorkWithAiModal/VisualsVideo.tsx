"use client"

import { useEffect, useRef, useState } from "react"
import { toast } from "react-toastify"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"

import { addTracksToProject, createTrack } from "@/app/api/mutation"
import { PLAY_ICON_GREEN } from "@/assets"
import { ActionButtons } from "@/components/ui/actionButton/ActionButton"
import { EXISTINGPRO_MODAL } from "@/constant/modalType"
import { TRACK_ADDED_TO_PROJECT_SUCCESSFULLY } from "@/constant/toastMessages"
import {
	generateUniqueFilename,
	generateWaveformImage,
	getFileInfo
} from "@/helpers"
import { resetModalSteps, updateModalStep } from "@/helpers/modalStepHelpers"
import upload from "@/helpers/upload"
import { ImageData } from "@/types/uploadTypes"
import { Button, Radio, RadioGroup } from "@nextui-org/react"
import { useMutation } from "@tanstack/react-query"

import { useDynamicStore, useModalStore } from "@/stores"

export const VisualsVideo = ({
	step,
	selectedAction,
	setSelectedAction
}: {
	step: number
	selectedAction: "modify" | "regenerate" | "generate"
	setSelectedAction: (action: "modify" | "regenerate") => void
}) => {
	const [smallWaveImage, setSmallWaveImage] = useState<ImageData | null>(null)
	const { addState, generatedVideo, audioFile, removeState, trackId } =
		useDynamicStore()
	const { showCustomModal, hideCustomModal } = useModalStore()
	const router = useRouter()
	const { id } = useParams()
	const videoRef = useRef<HTMLVideoElement>(null)
	const [isPlaying, setIsPlaying] = useState(false)
	const [loader, setLoader] = useState<boolean>(false)

	const togglePlayPause = () => {
		if (videoRef.current) {
			if (isPlaying) {
				videoRef.current.pause()
			} else {
				videoRef.current.play()
			}
			setIsPlaying(!isPlaying)
		}
	}

	const { mutate: createTrackMutation, isPending } = useMutation({
		mutationFn: (payload: FormData) => createTrack(payload),
		onSuccess: (data) => {
			if (data) {
				removeState("mediaId")
				addState("trackId", {
					file: data?.url,
					id: data?._id,
					mediaType: "video",
					name: data?.name,
					duration: data?.duration
				})
				if (step === 1) {
					updateModalStep(3)
				}
			}
		},
		onError: (error: Error) => {
			toast.error("Failed to create track: " + error.message)
		}
	})

	const { mutate: addTracksToProjectMutation, isPending: addingProject } =
		useMutation({
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

	let mediaId: string

	const addMediaId = (id: string) => {
		mediaId = id
	}

	const handleCreateTrack = async () => {
		const payload = new FormData()
		const uniqueName = generateUniqueFilename("recording", "mp4")
		payload.append("name", uniqueName)

		// if (audioFile) {
		// 	payload.append("file", audioFile)
		// }
		if (smallWaveImage?.blob)
			payload.append("imageWaveSmall", smallWaveImage?.blob)
		payload.append("isAIGenerated", "true")

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

		createTrackMutation(payload)
	}

	useEffect(() => {
		handleGenerateWaveformImage()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [audioFile])

	const handleGenerateWaveformImage = async () => {
		if (audioFile) {
			const smallWaveImage = await generateWaveformImage({
				audioUrl: generatedVideo || "",
				resolution: 512
			})
			setSmallWaveImage(smallWaveImage)
		}
	}

	return (
		<div className="w-full flex justify-center items-center">
			<div className="w-full flex flex-col gap-6 justify-center items-center bg-white rounded-xl">
				<div className="relative w-full max-h-[203px] aspect-video rounded-xl overflow-hidden">
					<video
						ref={videoRef}
						src={generatedVideo || ""}
						controls={false}
						loop
						className="w-full h-full object-cover bg-black"
					/>
					<div
						className="absolute inset-0 flex items-center justify-center cursor-pointer"
						onClick={togglePlayPause}
					>
						{!isPlaying && (
							<div className="w-16 h-16 bg-videoBtnGreen rounded-full flex items-center justify-center">
								<Image
									src={PLAY_ICON_GREEN}
									alt="play"
									width={38}
									height={38}
								/>
							</div>
						)}
					</div>
				</div>

				{step === 1 ? (
					<div className="flex justify-end mt-6 gap-4">
						<Button
							type="button"
							isLoading={isPending || loader}
							isDisabled={isPending || loader}
							onPress={() => {
								handleCreateTrack()
							}}
							className="px-4 py-2 rounded-lg bg-[#DDF5E5] text-[#0D5326] font-bold"
						>
							Continue
						</Button>

						<Button
							type="submit"
							onPress={() => {
								updateModalStep(2)
							}}
							className="px-4 py-2 rounded-lg bg-btnColor text-white font-bold"
						>
							Enhance
						</Button>
					</div>
				) : step === 2 ? (
					<RadioGroup
						value={selectedAction}
						onValueChange={(value) =>
							setSelectedAction(value as "modify" | "regenerate")
						}
						orientation="horizontal"
						classNames={{
							wrapper: "flex justify-center gap-[48px]"
						}}
					>
						<Radio
							value="modify"
							color="success"
							classNames={{
								label:
									"font-bold text-[16px] leading-[24px] tracking-[-0.01em] text-[#36393B]"
							}}
						>
							Modify
						</Radio>
						<Radio
							value="regenerate"
							color="success"
							classNames={{
								label:
									"font-bold text-[16px] leading-[24px] tracking-[-0.01em] text-[#36393B]"
							}}
						>
							Regenerate
						</Radio>
					</RadioGroup>
				) : !id ? (
					<ActionButtons
						onExistingProject={() => {
							showCustomModal({
								customModalType: EXISTINGPRO_MODAL,
								tempCustomModalData: {
									startSolo: true
								}
							})
							resetModalSteps()
						}}
						onNewProject={() => {
							resetModalSteps()
							hideCustomModal()
							router.push("/create-project")
						}}
						onSocialPost={() => {
							resetModalSteps()
							hideCustomModal()
							removeState("chips")
							router.push("/post-audio-or-video")
						}}
					/>
				) : (
					<div className="flex flex-col w-full items-center justify-center">
						<Button
							className="bg-btnColor text-white px-4 py-2 rounded-lg text-[13px] w-full max-w-[352px] hover:bg-btnColorHover"
							isLoading={addingProject}
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
		</div>
	)
}
