import { toast } from "react-toastify"
import { useRouter } from "next/navigation"

import { updateTrack } from "@/app/api/mutation"
import { STARS_ICON } from "@/assets"
import { ArtworkModal } from "@/components/dashboard/create-module/artwork-modal"
import { CreativeAgentModal } from "@/components/dashboard/create-module/creative-agent-modal"
import { RecordingModal } from "@/components/dashboard/create-module/recording-modal"
import { EXISTINGPRO_MODAL } from "@/constant/modalType"
import { resetModalSteps, updateModalStep } from "@/helpers/modalStepHelpers"
import { useMutation } from "@tanstack/react-query"

import { useDynamicStore, useModalStore } from "@/stores"
import { useGenerateAudio } from "@/hooks/useGenerateAudio"
import { useGenerateMedia } from "@/hooks/useGenerateMedia"

const RecordAIAudio = () => {
	const {
		addState,
		removeState,
		CreateFlow,
		generatedImage,
		modalSteps,
		trackId
	} = useDynamicStore()
	const { showCustomModal, hideCustomModal } = useModalStore()
	const router = useRouter()

	const { generateMediaContent, isPending: isGeneratingImage } =
		useGenerateMedia({
			onSuccess: (data: { url: string; file: Blob }) => {
				if (data) {
					addState("generatedImage", data?.url)
					handleUpdateTrack(data?.file)
				}
			}
		})

	const { mutate: updateTrackImg, isPending: isUpdateTrack } = useMutation({
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

	const handleUpdateTrack = (file: Blob) => {
		const formData = new FormData()
		if (file) {
			formData.append("artwork", file)
		}
		const uniqueName = `recording_${new Date().toISOString()}.mp3`
		formData.append("name", uniqueName)
		updateTrackImg(formData)
	}

	const { generateAudioContent, isGeneratingAudio } = useGenerateAudio({
		onSuccess: (data) => {
			if (data) {
				addState("CreateFlow", {
					...CreateFlow,
					recordingData: {
						file: data.file,
						url: data.url
					}
				})
				updateModalStep(1)
			}
		},
		onError: (error: Error) => {
			toast.error("Failed to generate audio: " + error.message)
		}
	})

	const handleGenerateAudio = (prompt: string) => {
		generateAudioContent({ prompt: prompt })
	}

	const handleGenerateImage = (prompt: string, type: string) => {
		generateMediaContent({
			prompt: prompt,
			media_type: type
		})
	}

	const stepComponents = [
		// Step 0: Initial AI prompt/input
		<CreativeAgentModal
			key="creative-agent-1"
			title="Tell us what kind of music you're looking for!"
			description=""
			icon={STARS_ICON}
			iconBgColor="#E8FAF0"
			inputIcon={{ type: "mic" }}
			onComplete={(file, type, text) => handleGenerateAudio(text)}
			isLoading={isGeneratingAudio}
			overlayModal
			overlayType="waveform"
		/>,

		// Step 1: preview generated audio
		<RecordingModal
			key="recording"
			createTrackFromAi
			audioUrl={CreateFlow?.recordingData?.url}
			audioFile={CreateFlow?.recordingData?.file}
			handleEnhance={() => {
				generateAudioContent({
					prompt: "Regenerate",
					audio_file: CreateFlow?.recordingData?.file
				})
			}}
			enhaceText="Regenerate"
			isEnhanceLoading={isGeneratingAudio}
			handleNavigation={(step: number) => updateModalStep(step - 1)}
		/>,

		// Step 2: Create your Artwork
		<CreativeAgentModal
			key="creative-agent-2"
			title="Create your Artwork"
			placeholder="Describe the artwork style or theme you want."
			description=""
			icon={STARS_ICON}
			inputIcon={{ type: "mic" }}
			mediaType="image"
			onComplete={(file, type, text) => handleGenerateImage(text, type)}
			isLoading={isGeneratingImage || isUpdateTrack}
		/>,

		// Step 3: Final Artwork
		<ArtworkModal
			key="artwork-modal"
			artworkUrl={generatedImage}
			share
			headClasses={{
				title: "hidden"
			}}
			padding="p-6 pt-[26px] pb-8"
			existingProject={{
				text: "Add to an existing project",
				onClick: () => {
					removeState("CreateFlow")
					resetModalSteps()
					showCustomModal({
						customModalType: EXISTINGPRO_MODAL,
						tempCustomModalData: {
							startSolo: true
						}
					})
				}
			}}
			newProject={{
				text: "Start a new project",
				onClick: () => {
					removeState("CreateFlow")
					resetModalSteps()
					hideCustomModal()
					removeState("collabData")
					removeState("trackId")
					router.push("/create-project")
				}
			}}
		/>
	]

	return stepComponents[modalSteps || 0]
}

export default RecordAIAudio
