"use client"

import { useRef, useState } from "react"
import { toast } from "react-toastify"

import { STARS_ICON } from "@/assets"
import { ArtworkModal } from "@/components/dashboard/create-module/artwork-modal"
import { Microphone } from "@/components/dashboard/create-module/microphone"
import { RecordingModal } from "@/components/dashboard/create-module/recording-modal"
import { SELECT_TRACK } from "@/constant/modalType"
import {
	generateUniqueFilename,
	generateWaveformImage,
	getFileInfo
} from "@/helpers"
import { updateModalStep } from "@/helpers/modalStepHelpers"
import upload from "@/helpers/upload"
import { fetchTrack } from "@/types/createOpportunityTypes"

import { useDynamicStore, useModalStore } from "@/stores"
import { useGenerateAudio } from "@/hooks/useGenerateAudio"

import SelectTrackModal from "../../selectTrackModal"

const Melodies = () => {
	const { modalSteps, recordingData, addState, updateState } = useDynamicStore()
	const { showCustomModal1 } = useModalStore()
	const [audioFile, setAudioFile] = useState<Blob | null>(null)
	const recordingRef = useRef<{ createTrack: (payload: FormData) => void }>(
		null
	)
	const [loader, setLoader] = useState<boolean>(false)

	const { generateAudioContent, isGeneratingAudio } = useGenerateAudio({
		onSuccess: async (data) => {
			if (data) {
				updateState("recordingData", {
					url: data.url
				})
				updateModalStep(4)
				setAudioFile(data.file)
			}
		}
	})

	// generate waveform image
	const handleGenerateWaveformImage = async (url: string) => {
		const smallWaveImage = await generateWaveformImage({
			audioUrl: url,
			resolution: 512
		})
		return smallWaveImage
	}

	const handleSubmit = () => {
		if (!audioFile || !recordingData?.instruments?.[0]) return

		generateAudioContent({
			prompt: recordingData.instruments[0].instrument,
			audio_file: audioFile
		})
	}

	const handleRecordingComplete = (url: string, audioBlob: Blob) => {
		setAudioFile(audioBlob)
		addState("recordingData", {
			url: url
		})
	}

	const handleFileSelect = async (files: FileList) => {
		if (files.length > 0) {
			const file = files[0] // Get the first file

			try {
				const arrayBuffer = await file.arrayBuffer()
				const blob = new Blob([arrayBuffer], { type: file.type })
				const blobUrl = URL.createObjectURL(blob)

				setAudioFile(blob)
				addState("recordingData", {
					url: blobUrl
				})
				updateModalStep(3)
			} catch (error) {
				console.error("Error processing file:", error)
			}
		}
	}

	const handleTrackSelect = async (selectedTracks: fetchTrack[]) => {
		if (selectedTracks.length > 0) {
			const track = selectedTracks[0]
			try {
				// Fetch the audio file from URL and convert to blob
				const response = await fetch(track.url || "")
				const blob = await response.blob()
				const blobUrl = URL.createObjectURL(blob)

				setAudioFile(blob)
				addState("recordingData", {
					url: blobUrl
				})
				updateModalStep(3)
			} catch (error) {
				console.error("Error processing track:", error)
				toast.error("Failed to load the selected track")
			}
		}
	}

	let mediaId: string

	const addMediaId = (id: string) => {
		mediaId = id
	}

	const handleCreateTrack = async () => {
		const smallWaveImage = await handleGenerateWaveformImage(
			recordingData?.url || ""
		)
		const payload = new FormData()
		if (smallWaveImage?.blob)
			payload.append("imageWaveSmall", smallWaveImage?.blob)
		const uniqueName = generateUniqueFilename()
		payload.append("name", uniqueName)
		payload.append("isAIGenerated", "true")
		payload.append("instrument[]", recordingData?.instruments?.[0]?._id)
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

		// payload.append("file", audioFile as Blob)
		await recordingRef.current?.createTrack(payload)
		updateModalStep(3)
	}

	const stepComponents = [
		<ArtworkModal
			modalSteps={modalSteps}
			key="generate"
			title="Give us an audio prompt for a spark!"
			description="You can either record from the mic, choose a file from the library, or upload from an external source"
			headClasses={{
				title: "text-[18px] font-bold leading-[27px] text-[#0A1629]",
				description: "text-textGray text-[16px] font-medium leading-[24px]"
			}}
			icon={{
				src: STARS_ICON,
				alt: "Melody",
				bgColor: "bg-videoBtnGreen"
			}}
			existingProject={{
				text: "Record from Mic",
				onClick: () => updateModalStep(1)
			}}
			newProject={{
				text: "Choose from Library",
				onClick: () => {
					showCustomModal1({ customModalTypeOne: SELECT_TRACK })
				}
			}}
			media={false}
			share
			shareButton={{
				text: "Upload files"
			}}
			onFileSelect={handleFileSelect}
		/>,
		<Microphone
			key="microphone"
			navigationState={modalSteps - 1}
			handleNavigation={(state) => updateModalStep(state + 1)}
			handleRecordingComplete={handleRecordingComplete}
		/>,
		<Microphone
			key="microphone"
			navigationState={modalSteps - 1}
			handleNavigation={(state) => updateModalStep(state + 1)}
			handleRecordingComplete={handleRecordingComplete}
		/>,
		<RecordingModal
			key="recording"
			ref={recordingRef}
			audioUrl={recordingData?.url}
			handleNavigation={(state) => updateModalStep(state + 1)}
			audioFile={audioFile as Blob}
			melody
			handleSubmit={handleSubmit}
			isLoading={isGeneratingAudio}
			overlayModal
		/>,
		<RecordingModal
			key="recording"
			ref={recordingRef}
			audioUrl={recordingData?.url}
			audioFile={audioFile as Blob}
			handleEnhance={() => {
				updateModalStep(3)
			}}
			handleSubmit={handleCreateTrack}
			enhaceText="Regenerate"
			isEnhanceLoading={isGeneratingAudio}
			handleNavigation={(step: number) => updateModalStep(step - 1)}
			isLoading={loader}
		/>
	]

	return (
		<>
			{stepComponents[modalSteps]}
			<SelectTrackModal onSubmit={handleTrackSelect} singleSelect />
		</>
	)
}

export default Melodies
