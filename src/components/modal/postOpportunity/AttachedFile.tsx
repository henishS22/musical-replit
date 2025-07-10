import React, { useEffect, useRef, useState } from "react"
import Image, { StaticImageData } from "next/image"

import { downloadTrack } from "@/app/api/query"
import {
	AUDIO_IMAGE,
	DOWNLOAD_IMAGE,
	PAUSE_IMAGE,
	PLAY_IMAGE,
	SavedIcon,
	TRACK_THUMBNAIL
} from "@/assets"
import { useQuery } from "@tanstack/react-query"
import WaveSurfer from "wavesurfer.js"

interface AudioFileProps {
	audioFile: {
		name: string
		extension: string
		duration: string
		imageWaveBig: string
		_id: string
		url?: string // Audio file URL for playback
		artwork?: string | StaticImageData
	}
	creator: string
	showTitle?: boolean
	showBorder?: boolean
	showSavedIcon?: boolean
	isLiked?: boolean
	handleFavorite?: () => void
	showHeading?: boolean
}

const AttachedFile: React.FC<AudioFileProps> = ({
	audioFile,
	creator,
	showTitle = true,
	showBorder = false,
	showSavedIcon = false,
	isLiked = false,
	handleFavorite,
	showHeading = true
}) => {
	const [isPlaying, setIsPlaying] = useState(false)
	const [duration, setDuration] = useState(
		audioFile?.duration
			? (Number(audioFile?.duration) / 1000).toFixed(2) // Convert to seconds
			: "0.00"
	)
	const [currentTime, setCurrentTime] = useState("0.00")
	const waveformRef = useRef<HTMLDivElement>(null)
	const wavesurferRef = useRef<WaveSurfer | null>(null)
	const audioUrl = audioFile?.url || ""

	// Helper function to format time in MM:SS format
	const formatTime = (timeInSeconds: string) => {
		const seconds = Math.floor(parseFloat(timeInSeconds))
		const minutes = Math.floor(seconds / 60)
		const remainingSeconds = seconds % 60
		return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
	}

	const { refetch, isFetching } = useQuery({
		queryKey: ["download", audioFile?._id],
		queryFn: () =>
			downloadTrack(audioFile?._id, audioFile?.name, audioFile?.extension),
		enabled: false
	})

	// Initialize WaveSurfer
	useEffect(() => {
		if (waveformRef.current && audioUrl) {
			// If the wavesurfer instance already exists, destroy it first
			if (wavesurferRef.current) {
				wavesurferRef.current.destroy()
			}

			// Create new wavesurfer instance
			const wavesurfer = WaveSurfer.create({
				container: waveformRef.current,
				waveColor: "#CCCCCC",
				progressColor: "#1DB954",
				cursorColor: "transparent",
				barWidth: 2,
				barGap: 3,
				barRadius: 3,
				height: 44,
				normalize: true
			})

			// Load audio file
			wavesurfer.load(audioUrl)

			// Set event listeners
			wavesurfer.on("ready", () => {
				wavesurferRef.current = wavesurfer
				// Update duration when audio is loaded
				if (wavesurfer.getDuration()) {
					setDuration(wavesurfer.getDuration().toFixed(2))
				}
			})

			wavesurfer.on("audioprocess", () => {
				if (wavesurferRef.current) {
					setCurrentTime(wavesurferRef.current.getCurrentTime().toFixed(2))
				}
			})

			wavesurfer.on("finish", () => {
				setIsPlaying(false)
			})

			// Clean up when component unmounts
			return () => {
				if (wavesurferRef.current) {
					wavesurferRef.current.destroy()
				}
			}
		}
	}, [audioUrl])

	const togglePlayPause = () => {
		if (!wavesurferRef.current) return

		if (isPlaying) {
			wavesurferRef.current.pause()
		} else {
			wavesurferRef.current.play()
		}
		setIsPlaying(!isPlaying)
	}

	// const mediaType = getMediaType(`${audioFile?.name}.${audioFile?.extension}`)

	return (
		<div className="flex flex-col mt-4 w-full">
			<div className="flex justify-between items-center">
				{showHeading && (
					<div className="text-sm font-bold tracking-tight text-neutral-700 max-md:max-w-full">
						Attached Files
					</div>
				)}
				{showSavedIcon && (
					<div onClick={handleFavorite} className="cursor-pointer">
						<SavedIcon isLiked={isLiked} />
					</div>
				)}
			</div>
			<div className="flex flex-col mt-1 w-full max-md:max-w-full">
				{showTitle && (
					<div className="flex flex-wrap gap-1 justify-center items-center w-full text-sm font-semibold tracking-tight whitespace-nowrap text-neutral-700 max-md:max-w-full">
						<Image
							loading="lazy"
							src={AUDIO_IMAGE}
							className="object-contain shrink-0 self-stretch my-auto w-5 aspect-square"
							alt="audio-thumbnail"
							width={20}
							height={20}
						/>
						<div className="flex-1 shrink self-stretch my-auto basis-0 max-md:max-w-full">
							{audioFile?.name || ""}
						</div>
					</div>
				)}
				<div
					className={`flex relative gap-5 items-start p-2.5 mt-2 w-full rounded-lg bg-zinc-100 max-md:max-w-full ${showBorder ? "border border-[#1DB954] rounded-lg" : ""}`}
				>
					<div className="flex z-0 flex-1 shrink gap-2.5 items-center my-auto w-full basis-0 min-w-[240px] max-md:max-w-full">
						<div className="flex flex-wrap flex-1 shrink gap-4 self-stretch my-auto w-full basis-0 min-w-[240px] max-md:max-w-full">
							<Image
								loading="lazy"
								src={audioFile?.artwork || TRACK_THUMBNAIL}
								className="object-contain shrink-0 my-auto aspect-square w-[100px]"
								alt="artwork"
								width={100}
								height={100}
							/>
							<div className="flex flex-col flex-1 shrink justify-between basis-0 min-w-[240px] max-md:max-w-full">
								<div className="flex gap-2 items-center w-9 text-xs font-medium tracking-normal text-white whitespace-nowrap">
									<div className="flex flex-col justify-center self-stretch px-2 py-0.5 my-auto w-9 bg-blue-500 rounded-lg">
										<div className="gap-1.5 self-stretch w-full">
											{audioFile?.extension || "mp3"}
										</div>
									</div>
								</div>
								<div className="flex flex-col w-full text-black max-md:max-w-full">
									<div className="flex flex-wrap gap-10 justify-between items-center w-full max-md:max-w-full">
										<div className="flex flex-col self-stretch my-auto">
											<div className="text-sm font-semibold tracking-tight">
												{audioFile?.name || ""}
											</div>
											<div className="text-xs tracking-tight">
												{creator || ""}
											</div>
										</div>
										<Image
											loading="lazy"
											src={DOWNLOAD_IMAGE}
											className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square cursor-pointer"
											alt="Download button"
											width={24}
											height={24}
											onClick={() => (isFetching ? null : refetch())}
										/>
									</div>
								</div>
								<div className="flex flex-wrap gap-3 items-center w-full text-base text-right text-neutral-400 max-md:max-w-full">
									{/* Wavesurfer waveform container */}
									<div
										ref={waveformRef}
										className="object-cover flex-1 shrink self-stretch my-auto basis-0 min-w-[240px] w-[448px] h-[44px] max-md:max-w-full"
									/>
									<div className="self-stretch my-auto">
										{formatTime(currentTime)} / {formatTime(duration)}
									</div>
								</div>
							</div>
						</div>
					</div>
					<Image
						loading="lazy"
						src={isPlaying ? PAUSE_IMAGE : PLAY_IMAGE}
						className="object-contain absolute bottom-[40px] left-10 z-10 shrink-0 self-start w-10 h-10 aspect-square cursor-pointer"
						alt={isPlaying ? "Pause" : "Play"}
						width={40}
						height={40}
						onClick={togglePlayPause}
					/>
				</div>
			</div>
		</div>
	)
}

export default AttachedFile
