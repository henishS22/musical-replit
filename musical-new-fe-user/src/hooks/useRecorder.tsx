/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef, useState } from "react"
import { toast } from "react-toastify"

import { createTrack } from "@/app/api/mutation"
import { RECORDING_COMPLETE_MODAL } from "@/constant/modalType"
import {
	fetchMediaDuration,
	generateUniqueFilename,
	generateWaveformImage,
	getFileInfo
} from "@/helpers"
import upload from "@/helpers/upload"
import { TrackResponse } from "@/types"
import { ImageData } from "@/types/uploadTypes"
import { useMutation } from "@tanstack/react-query"

import { useDynamicStore, useModalStore } from "@/stores"

type StatusType = "idle" | "recording" | "paused"

// Custom hook for handling video recording and media stream
export const useRecorder = () => {
	const { addState, updateState, removeState } = useDynamicStore()
	const { showCustomModal } = useModalStore()
	const [duration, setDuration] = useState<number>(0)
	const durationIntervalRef = useRef<NodeJS.Timeout>()

	//state management for recording steps
	const [recordingSteps, setRecordingSteps] = useState(0)

	// State management for recording status and media data
	const [status, setStatus] = useState<StatusType>("idle") // Tracks the recording status
	const [recorder, setRecorder] = useState<MediaRecorder | null>(null) // Reference to the MediaRecorder instance
	const [stream, setStream] = useState<MediaStream | null>(null) // Stores the active media stream
	const [blobUrl, setBlobUrl] = useState("") // URL of the recorded video blob
	const [blob, setBlob] = useState<Blob | null>(null) // Stores the final video blob
	const [smallWaveImage, setSmallWaveImage] = useState<ImageData | null>(null)

	// Refs for managing video and media
	const videoRef = useRef<HTMLVideoElement>(null) // Reference to the video element
	const mediaStreamRef = useRef<MediaStream | null>(null) // Reference to the active media stream
	const mediaRecorderRef = useRef<MediaRecorder | null>(null) // Reference to the active MediaRecorder
	const chunksRef = useRef<Blob[]>([]) // Array to store chunks of the recorded video

	// State for toggling recording, camera, and microphone
	const [isRecording, setIsRecording] = useState(false) // Tracks if recording is active
	const [isCameraOn, setIsCameraOn] = useState(true) // Tracks if the camera is on
	const [isMicOn, setIsMicOn] = useState(true) // Tracks if the microphone is on
	const [loader, setLoader] = useState<boolean>(false)

	const { mutate: createTrackMutation, isPending } = useMutation({
		mutationFn: (payload: FormData) => createTrack(payload),
		onSuccess: (data) => {
			if (data) {
				removeState("mediaId")
				updateState("trackId", {
					file: data?.url,
					id: data?._id,
					duration: data?.duration,
					mediaType: "video",
					name: data?.name
				})
				setRecordingSteps(recordingSteps + 1)
				// showCustomModal({ customModalType: RECORDING_COMPLETE_MODAL })
			}
		},
		onError: (error: Error) => {
			toast.error(error.message)
		}
	})

	// Streaming media to the video element
	useEffect(() => {
		if (stream && videoRef.current && status === "recording") {
			videoRef.current.srcObject = stream // Assign the stream to the video element
		}
	}, [stream, status])

	// Pauses the recording
	const pauseRecording = () => {
		if (recorder && status === "recording") {
			recorder.pause() // Pause the recorder
			setStatus("paused") // Update the status
		}
	}

	// Resumes the recording
	const resumeRecording = () => {
		if (recorder && status === "paused") {
			recorder.resume() // Resume the recorder
			setStatus("recording") // Update the status
		}
	}

	// Starts the camera and microphone
	const startCamera = async (videoRef: React.RefObject<HTMLVideoElement>) => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: isCameraOn,
				audio: isMicOn
			})
			mediaStreamRef.current = stream // Save the stream to ref
			if (videoRef.current) {
				videoRef.current.srcObject = stream // Attach the stream to the video element
				videoRef.current.play() // Play the video
			}
		} catch {
			toast.error("Error accessing media devices:")
		}
	}

	// Stops the camera and clears resources
	const stopCamera = (videoRef: React.RefObject<HTMLVideoElement>) => {
		if (mediaStreamRef.current) {
			mediaStreamRef.current.getTracks().forEach((track) => {
				track.stop() // Stop each track in the stream
			})
			mediaStreamRef.current = null // Clear the stream reference
		}

		if (videoRef.current) {
			videoRef.current.srcObject = null // Clear the video element's source
		}
	}

	let mediaId: string

	const addMediaId = (id: string) => {
		mediaId = id
	}

	// Starts the recording process
	const startRecording = () => {
		if (!mediaStreamRef.current) return // Ensure there's a stream to record
		mediaRecorderRef.current = new MediaRecorder(mediaStreamRef.current) // Create a new MediaRecorder instance
		chunksRef.current = [] // Clear any previous chunks

		let seconds = 0
		durationIntervalRef.current = setInterval(() => {
			seconds++
			setDuration(seconds)
		}, 1000)

		// Collect data chunks while recording
		mediaRecorderRef.current.ondataavailable = (event) => {
			if (event.data.size > 0) {
				chunksRef.current.push(event.data)
			}
		}

		// Save the recording as a blob when stopped
		mediaRecorderRef.current.onstop = async () => {
			const blob = new Blob(chunksRef.current, { type: "video/mp4" })
			const url = URL.createObjectURL(blob)
			// generate waveform image
			const smallWaveImage = await generateWaveformImage({
				audioUrl: url,
				resolution: 512
			})
			setSmallWaveImage(smallWaveImage)

			addState("trackId", {
				file: url,
				mediaType: "video"
			})
			const payload = new FormData()
			const uniqueName = generateUniqueFilename("recording", "mp4")
			payload.append("name", uniqueName)

			// if (blob) {
			// 	payload.append("file", blob)
			// }
			if (smallWaveImage?.blob)
				payload.append("imageWaveSmall", smallWaveImage?.blob)

			const { size, extension, type } = await getFileInfo(blob as File)
			await upload(blob as File, setLoader, addMediaId, size, extension, type)
			payload.append("_id", mediaId)
			payload.append(
				"url",
				`${process.env.NEXT_PUBLIC_STORAGE_URL}/${mediaId}.${extension}`
			)

			payload.append("fileSize", size.toString())
			payload.append("extension", extension)
			createTrackMutation(payload)
			// const a = document.createElement("a")
			// a.href = url
			// a.download = "recorded-video.mp4" // Sets the download filename
			// a.click()
			// URL.revokeObjectURL(url) // Clean up the object URL
		}

		mediaRecorderRef.current.start() // Start recording
		setIsRecording(true) // Update recording state
	}

	// Stops the recording process
	const stopRecording = () => {
		if (durationIntervalRef.current) {
			clearInterval(durationIntervalRef.current)
		}
		mediaRecorderRef.current?.stop() // Stop the recorder
		setIsRecording(false) // Update recording state
		stopCamera(videoRef)
	}

	// Toggles the microphone on/off
	const toggleMicrophone = () => {
		setIsMicOn((prev) => {
			const newMicState = !prev
			mediaStreamRef.current
				?.getAudioTracks()
				.forEach((track) => (track.enabled = newMicState)) // Enable/disable audio tracks
			return newMicState
		})
	}

	// Toggles the camera on/off
	const toggleCamera = () => {
		setIsCameraOn((prev) => {
			const newCameraState = !prev
			mediaStreamRef.current
				?.getVideoTracks()
				.forEach((track) => (track.enabled = newCameraState)) // Enable/disable video tracks
			return newCameraState
		})
	}

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (durationIntervalRef.current) {
				clearInterval(durationIntervalRef.current)
			}
		}
	}, [])

	return {
		blob,
		blobUrl,
		status,
		videoRef,
		isMicOn,
		isCameraOn,
		isRecording,
		startCamera,
		stopCamera,
		toggleMicrophone,
		toggleCamera,
		startRecording,
		stopRecording,
		pauseRecording,
		resumeRecording,
		isPending,
		recordingSteps
	}
}
