import { useState } from "react"
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"

import { updateTrack } from "@/app/api/mutation"
import { STARS_ICON } from "@/assets"
import { ArtworkModal } from "@/components/dashboard/create-module/artwork-modal"
import { CreativeAgentModal } from "@/components/dashboard/create-module/creative-agent-modal"
import { Microphone } from "@/components/dashboard/create-module/microphone"
import { RecordingModal } from "@/components/dashboard/create-module/recording-modal"
import { EXISTINGPRO_MODAL } from "@/constant/modalType"
import { resetModalSteps, updateModalStep } from "@/helpers/modalStepHelpers"
import { useMutation } from "@tanstack/react-query"

import { useDynamicStore, useModalStore } from "@/stores"
import { useGenerateAudio } from "@/hooks/useGenerateAudio"
import { useGenerateMedia } from "@/hooks/useGenerateMedia"

const RecordSelf = () => {
	const {
		addState,
		updateState,
		CreateFlow,
		generatedImage,
		trackId,
		modalSteps
	} = useDynamicStore()
	const { showCustomModal, hideCustomModal } = useModalStore()
	const { removeState } = useDynamicStore()
	const [localNavigationState, setLocalNavigationState] = useState(0)
	const router = useRouter()

	//for generating artwork
	const { generateMediaContent, isPending: isGeneratingImage } =
		useGenerateMedia({
			onSuccess: (data: { url: string; file: Blob }) => {
				addState("generatedImage", data?.url)
				handleUpdateTrack(data?.file)
			},
			onError: (error: Error) => {
				toast.error(
					error instanceof Error ? error.message : "An unknown error occurred."
				)
			}
		})

	//for generating audio from audio file
	const { generateAudioContent, isGeneratingAudio } = useGenerateAudio({
		onSuccess: (data) => {
			updateState("CreateFlow", {
				...CreateFlow,
				recordingData: {
					file: data.file,
					url: data.url
				}
			})
			updateModalStep(4)
		}
	})

	//for updating track with artwork after generating artwork
	const { mutate: updateTrackImg, isPending: isUpdatingTrack } = useMutation({
		mutationFn: (val: FormData) => updateTrack(trackId?.id as string, val),
		onSuccess: (data) => {
			if (data) {
				updateModalStep(modalSteps + 1)
			}
		},
		onError: (error: Error) => {
			toast.error(
				error instanceof Error ? error.message : "An unknown error occurred."
			)
		}
	})

	//for generating artwork
	const handleSubmit = (type: string, message: string) => {
		if (!message.trim()) return
		generateMediaContent({
			prompt: message,
			media_type: type
		})
	}

	//for updating track with artwork after generating artwork
	const handleUpdateTrack = (file: Blob) => {
		const formData = new FormData()

		if (file) {
			formData.append("artwork", file)
		}
		const uniqueName = `recording_${new Date().toISOString()}.mp3`
		formData.append("name", uniqueName)
		updateTrackImg(formData)
	}

	//for recording audio from microphone
	const handleRecordingComplete = async (url: string, audioBlob: Blob) => {
		updateState("CreateFlow", {
			...CreateFlow,
			recordingData: {
				file: audioBlob,
				url: url
			}
		})
	}

	//for generating audio from audio file
	const handleGenerateAudio = (prompt: string) => {
		generateAudioContent({
			prompt: prompt,
			audio_file: CreateFlow?.recordingData?.file
		})
	}

	switch (modalSteps || 0) {
		case 0:
			return (
				<Microphone
					navigationState={localNavigationState}
					handleNavigation={(step) => {
						setLocalNavigationState(step)
						updateModalStep(step)
					}}
					handleRecordingComplete={handleRecordingComplete}
				/>
			)
		case 1:
			return (
				<Microphone
					navigationState={localNavigationState}
					handleNavigation={(step) => {
						setLocalNavigationState(step)
						updateModalStep(step)
					}}
					handleRecordingComplete={handleRecordingComplete}
				/>
			)
		case 2:
			return (
				<RecordingModal
					audioUrl={CreateFlow?.recordingData?.url}
					handleNavigation={(step: number) => updateModalStep(step + 2)}
					audioFile={CreateFlow?.recordingData?.file}
					handleEnhance={() => updateModalStep(3)}
				/>
			)
		case 3:
			return (
				<CreativeAgentModal
					title="Tell us how you want to enhance your music!"
					description=""
					placeholder="Describe the music you want to generate..."
					icon={STARS_ICON}
					inputIcon={{ type: "mic" }}
					isLoading={isGeneratingAudio}
					onComplete={(file, type, message) => {
						handleGenerateAudio(message)
					}}
					overlayModal
					overlayType="waveform"
				/>
			)
		case 4:
			return (
				<RecordingModal
					audioUrl={CreateFlow?.recordingData?.url}
					handleNavigation={(step: number) => updateModalStep(step + 2)}
					audioFile={CreateFlow?.recordingData?.file}
				/>
			)
		case 5:
			return (
				<ArtworkModal
					icon={{
						src: STARS_ICON,
						alt: "Stars Icon",
						bgColor: "bg-videoBtnGreen"
					}}
					title="Design Your Music Artwork"
					headClasses={{
						title: "text-[#0A1629] text-base font-medium leading-6",
						description: "text-[#7D8592] text-base font-normal leading-6"
					}}
					description="Please subscribe to use this feature."
					newProject={{
						text: "Subscribe",
						onClick: () => updateModalStep(7)
					}}
					existingProject={{
						text: "Next",
						onClick: () => updateModalStep(6)
					}}
					media={false}
					padding="px-6 pt-[26px] pb-[45px]"
					artworkUrl={generatedImage}
				/>
			)
		case 6:
			return (
				<RecordingModal
					audioUrl={CreateFlow?.recordingData?.url}
					handleNavigation={(step) => updateModalStep(step)}
					audioFile={CreateFlow?.recordingData?.file}
					melody
					isPromoteFlow
					onExistingProject={() => {
						resetModalSteps()
						removeState("CreateFlow")
						hideCustomModal()
						showCustomModal({
							customModalType: EXISTINGPRO_MODAL,
							tempCustomModalData: {
								startSolo: true
							}
						})
					}}
					onNewProject={() => {
						resetModalSteps()
						removeState("CreateFlow")
						hideCustomModal()
						router.push("/create-project")
					}}
					onSocialPost={() => {
						resetModalSteps()
						removeState("CreateFlow")
						removeState("chips")
						hideCustomModal()
						router.push("/post-audio-or-video")
					}}
				/>
			)
		case 7:
			return (
				<CreativeAgentModal
					title="Create your Artwork"
					description=""
					placeholder="Describe the artwork style or theme you want."
					icon={STARS_ICON}
					inputIcon={{ type: "mic" }}
					mediaType="image"
					onComplete={(file: File | null, type: string, message: string) => {
						handleSubmit(type, message)
					}}
					isLoading={isGeneratingImage || isUpdatingTrack}
				/>
			)
		case 8:
			return (
				<ArtworkModal
					artworkUrl={generatedImage}
					title=""
					description=""
					newProject={{
						text: "Start a new project",
						onClick: () => {
							resetModalSteps()
							removeState("CreateFlow")
							hideCustomModal()
							router.push("/create-project")
						}
					}}
					existingProject={{
						text: "Add to an existing project",
						onClick: () => {
							resetModalSteps()
							removeState("CreateFlow")
							hideCustomModal()
							showCustomModal({
								customModalType: EXISTINGPRO_MODAL,
								tempCustomModalData: {
									startSolo: true
								}
							})
						}
					}}
					share
					shareButton={{
						text: "Post to Social"
					}}
				/>
			)
		default:
			return null
	}
}

export default RecordSelf
