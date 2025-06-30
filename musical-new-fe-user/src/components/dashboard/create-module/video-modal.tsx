"use client"

import { useEffect } from "react"
import Image from "next/image"

import {
	CAMERA_VIDEO_MIC_OFF,
	CAMERA_VIDEO_MIC_ON,
	CAMERA_VIDEO_OFF,
	CAMERA_VIDEO_ON,
	CAMERA_VIDEO_PAUSE,
	CAMERA_VIDEO_PLAY
} from "@/assets"
import { Button } from "@nextui-org/react"

import { useDynamicStore } from "@/stores"
import { useRecorder } from "@/hooks"

import { ArtworkModal } from "./artwork-modal"

export function VideoModal() {
	const {
		// status,
		isMicOn,
		videoRef,
		isCameraOn,
		isRecording,
		startCamera,
		stopCamera,
		toggleMicrophone,
		toggleCamera,
		startRecording,
		stopRecording,
		isPending,
		recordingSteps
	} = useRecorder()
	const { videoUrl } = useDynamicStore()

	useEffect(() => {
		if (recordingSteps === 0) {
			startCamera(videoRef)
		} else {
			stopCamera(videoRef)
		}

		return () => {
			stopCamera(videoRef)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [recordingSteps])

	return recordingSteps === 0 ? (
		<div>
			{/* Leave Button and Record Video */}
			{(isRecording || isPending) && (
				<div className=" left-4 right-4 flex items-center justify-between">
					{/* <span className="absolute text-base !top-[95px] !left-6 font-semibold text-[#FFFFFF] z-10">
						Record Video
					</span> */}
					<Button
						onPress={stopRecording}
						className="absolute !top-[95px] !right-6 !z-10 bg-[#F65160] text-[#FFFFFF] text-sm py-[6px] px-3 rounded-[8px]"
						isLoading={isPending}
					>
						{isPending ? "Uploading" : "Leave"}
					</Button>
				</div>
			)}
			<div className="p-4">
				<div className="relative bg-[#0A1629] rounded-[20px]">
					<video
						controls={false}
						ref={videoRef}
						width={200}
						// height={200}
						className="rounded-2xl w-full border"
					/>
					<div className="absolute flex gap-4 w-full items-center justify-center bottom-4">
						<div
							className={`h-16 w-16 rounded-full flex items-center justify-center cursor-pointer ${!isRecording ? "bg-videoBtnGreen" : "bg-videoBtnRed"}`}
							onClick={isRecording ? stopRecording : startRecording}
						>
							<Image
								src={isRecording ? CAMERA_VIDEO_PAUSE : CAMERA_VIDEO_PLAY}
								height={32}
								width={32}
								alt="play-icon"
							/>
						</div>
						<div
							className={`h-16 w-16 rounded-full flex items-center justify-center cursor-pointer ${isMicOn ? "bg-videoBtnGreen" : "bg-videoBtnRed"}`}
							onClick={toggleMicrophone}
						>
							{" "}
							<Image
								src={isMicOn ? CAMERA_VIDEO_MIC_ON : CAMERA_VIDEO_MIC_OFF}
								height={32}
								width={32}
								alt="mic-icon"
							/>
						</div>
						<div
							className={`h-16 w-16 rounded-full flex items-center justify-center cursor-pointer ${isCameraOn ? "bg-videoBtnGreen" : "bg-videoBtnRed"}`}
							onClick={toggleCamera}
						>
							{" "}
							<Image
								src={isCameraOn ? CAMERA_VIDEO_ON : CAMERA_VIDEO_OFF}
								height={32}
								width={32}
								alt="camera-icon"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	) : (
		<ArtworkModal artworkUrl={videoUrl} share />
	)
}
