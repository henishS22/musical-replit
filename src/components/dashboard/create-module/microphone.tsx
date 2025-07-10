"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"

import { CAMERA_VIDEO_MIC_ON } from "@/assets"
import { Button } from "@nextui-org/react"

import { AudioVisualizer } from "./audio-visualizer"

interface MicrophoneProps {
	handleRecordingComplete: (state: string, audioBlob: Blob) => void
	navigationState: number
	handleNavigation: (state: number) => void
}

//navigationState == 0 then Microphone start recording
//navigationState == 1 Audio Visualizer and all isRecording things
//navigationState == 2 Recording Compete Modal
//navigationState == 3 Creative Agent

export function Microphone({
	navigationState,
	handleNavigation,
	handleRecordingComplete
}: MicrophoneProps) {
	const [isPaused, setIsPaused] = useState(false)
	const [hasPermission, setHasPermission] = useState<boolean | null>(true)
	const mediaRecorderRef = useRef<MediaRecorder | null>(null)
	const mediaStreamRef = useRef<MediaStream | null>(null)
	const chunksRef = useRef<Blob[]>([])

	const checkPermission = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: true
			})
			setHasPermission(true)
			stream.getTracks().forEach((track) => track.stop())
		} catch (error) {
			console.error("Permission check failed:", error)
			setHasPermission(false)
		}
	}

	useEffect(() => {
		checkPermission()
	}, [])

	const startRecording = async () => {
		if (!hasPermission) return

		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
			mediaStreamRef.current = stream

			const mediaRecorder = new MediaRecorder(stream)
			mediaRecorderRef.current = mediaRecorder
			chunksRef.current = []

			mediaRecorder.ondataavailable = (e) => {
				chunksRef.current.push(e.data)
			}

			mediaRecorder.onstop = async () => {
				const audioBlob = new Blob(chunksRef.current, { type: "audio/wav" })
				const url = URL.createObjectURL(audioBlob)
				handleRecordingComplete(url, audioBlob)
				handleNavigation(2)
				setIsPaused(false)
			}

			mediaRecorder.start()
			handleNavigation(1)
			setIsPaused(false)
		} catch (error) {
			console.error("Error starting recording:", error)
		}
	}

	const pauseRecording = () => {
		if (mediaRecorderRef.current && !isPaused) {
			mediaRecorderRef.current.pause()
			setIsPaused(true)
		} else if (mediaRecorderRef.current && isPaused) {
			mediaRecorderRef.current.resume()
			setIsPaused(false)
		}
	}

	const stopRecording = () => {
		if (mediaRecorderRef.current) {
			mediaRecorderRef.current.stop()
			mediaStreamRef.current?.getTracks().forEach((track) => track.stop())
			mediaRecorderRef.current = null
		}
	}

	const renderContent = () => {
		switch (navigationState) {
			case 0: // Start Recording Screen
				return (
					<div>
						<div className="relative flex items-center justify-center">
							<div className="relative w-16 h-16 rounded-full flex items-center justify-center cursor-pointer bg-white">
								<Image
									src={CAMERA_VIDEO_MIC_ON}
									alt="Microphone"
									width={32}
									height={32}
									className="block mx-auto" // Ensures the image is centered within the div
								/>
							</div>
						</div>
						<div className="text-center mt-6">
							<h3 className="text-[15px] text-textGray font-medium">
								Use Microphone
							</h3>
							<p className="text-[15px] text-textGray font-medium mb-2">
								Record directly from the Guild Mic
							</p>
							<p className="text-[15px] text-textGray">
								{!hasPermission && "Please allow microphone access"}
							</p>
							<Button
								className="mt-10 px-4 py-2 bg-btnColor text-white rounded-lg hover:bg-[#1DB954]/90 transition-colors"
								onPress={startRecording}
							>
								Start
							</Button>
						</div>
					</div>
				)
			case 1:
				return (
					<div>
						<div className="relative flex justify-center">
							<div className="bg-btnColor relative w-16 h-16 rounded-full flex items-center justify-center cursor-pointer ">
								<AudioVisualizer
									mediaStream={mediaStreamRef.current}
									navigationState={navigationState}
									isPaused={isPaused}
								/>
							</div>
						</div>

						<div className="text-center mt-6">
							<p className="text-[15px] text-textGray font-medium mb-2">
								Record directly from the Guild Mic
							</p>
							<p className="text-[15px] text-textGray">
								{!hasPermission && "Please allow microphone access"}
							</p>
							<div className="flex gap-2 justify-center mt-6">
								<Button
									className="px-4 py-2 bg-btnColor text-white rounded-lg hover:bg-[#1DB954]/90 transition-colors"
									onPress={pauseRecording}
								>
									{isPaused ? "Resume" : "Pause"}
								</Button>
								<Button
									className="px-4 py-2 bg-btnColor text-white rounded-lg hover:bg-[#F65160]/90 transition-colors"
									onPress={stopRecording}
								>
									Stop
								</Button>
							</div>
						</div>
					</div>
				)
		}
	}

	return (
		<div className="flex justify-center items-center p-6 bg-[#FFFFFF] rounded-2xl">
			{/* Box container with constrained height */}
			<div className="flex flex-col items-center justify-center p-6 w-[492px] max-h-[400px] bg-[#FCFCFC] rounded-xl">
				{renderContent()}
			</div>
		</div>
	)
}
