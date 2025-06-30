import { FC, useEffect, useRef, useState } from "react"
import Image from "next/image"

import { MEDIA_PREVIEW, VINYL_RECORD } from "@/assets"
import { fetchTrack } from "@/types/createOpportunityTypes"
import { Loader2, Pause, Play, Volume2, VolumeX } from "lucide-react"

import { useDynamicStore } from "@/stores"

const MediaPlayer: FC<{
	trackDetails: fetchTrack
	refetch: () => void
	isFetching: boolean
}> = ({ trackDetails, refetch, isFetching }) => {
	const { trackId, url } = useDynamicStore()

	const videoRef = useRef<HTMLVideoElement>(null)
	const [isPlaying, setIsPlaying] = useState(false)
	const [progress, setProgress] = useState(0)
	const [currentTime, setCurrentTime] = useState("0:00")
	const [duration, setDuration] = useState("0:00")
	const [volume, setVolume] = useState(1)
	const [isLoading, setIsLoading] = useState(true)
	const progressRef = useRef<HTMLDivElement>(null)
	const [isDragging, setIsDragging] = useState(false)
	const [isMuted, setIsMuted] = useState(false)

	useEffect(() => {
		const video = videoRef.current
		if (video) {
			video.addEventListener("loadedmetadata", handleLoadedMetadata)
			video.addEventListener("timeupdate", handleTimeUpdate)
			video.addEventListener("ended", () => setIsPlaying(false))
			setIsLoading(false)
		}

		// Add keyboard event listeners
		window.addEventListener("keydown", handleKeyDown)

		return () => {
			if (video) {
				video.removeEventListener("loadedmetadata", handleLoadedMetadata)
				video.removeEventListener("timeupdate", handleTimeUpdate)
				video.removeEventListener("ended", () => setIsPlaying(false))
			}
			// Remove keyboard event listeners
			window.removeEventListener("keydown", handleKeyDown)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [videoRef.current])

	// Handle track changes
	useEffect(() => {
		if (videoRef.current) {
			setIsPlaying(false)
			setProgress(0)
			setCurrentTime("0:00")
			videoRef.current.currentTime = 0
			videoRef.current.load()
		}
	}, [trackId])

	const handlePlayPause = async () => {
		const video = videoRef.current
		if (!video) return

		try {
			if (isPlaying) {
				await video.pause()
			} else {
				await video.play()
			}
			setIsPlaying(!isPlaying)
		} catch (error) {
			console.error("Error playing/pausing media:", error)
			refetch()
			setIsPlaying(false)
		}
	}

	const handleTimeUpdate = () => {
		const video = videoRef.current
		if (video && video.duration) {
			const percent = (video.currentTime / video.duration) * 100
			setProgress(percent) // Update progress continuously
			setCurrentTime(formatTime(video.currentTime)) // Update current time continuously
		}
	}

	const handleLoadedMetadata = () => {
		const video = videoRef.current
		if (video) {
			setDuration(formatTime(video.duration))
			setCurrentTime(formatTime(video.currentTime))
			setProgress((video.currentTime / video.duration) * 100) // Set initial progress
		}
	}

	const formatTime = (time: number) => {
		if (isNaN(time) || time < 0) return "0:00"
		const minutes = Math.floor(time / 60)
		const seconds = Math.floor(time % 60)
		return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
	}

	const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const volumeLevel = Number(e.target.value)
		setVolume(volumeLevel)
		const video = videoRef.current
		if (video) {
			video.volume = volumeLevel
		}
	}

	const handleProgressMouseDown = () => {
		setIsDragging(true)
	}

	const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!isDragging || !videoRef.current || !progressRef.current) return
		const rect = progressRef.current.getBoundingClientRect()
		const clickPosition = e.clientX - rect.left
		const newTime = (clickPosition / rect.width) * videoRef.current.duration
		videoRef.current.currentTime = newTime
		setProgress((newTime / videoRef.current.duration) * 100)
	}

	const handleProgressMouseUp = () => {
		setIsDragging(false)
	}

	const toggleFullScreen = () => {
		const video = videoRef.current
		if (video) {
			if (document.fullscreenElement) {
				document.exitFullscreen()
			} else {
				video.requestFullscreen()
			}
		}
	}

	const handleKeyDown = (e: KeyboardEvent) => {
		const video = videoRef.current
		if (!video) return

		switch (e.key) {
			case "ArrowLeft":
				video.currentTime = Math.max(0, video.currentTime - 5)
				break
			case "ArrowRight":
				video.currentTime = Math.min(video.duration, video.currentTime + 5)
				break
			case "ArrowUp":
				video.volume = Math.min(1, video.volume + 0.1)
				setVolume(video.volume)
				break
			case "ArrowDown":
				video.volume = Math.max(0, video.volume - 0.1)
				setVolume(video.volume)
				break
			default:
				break
		}
	}

	const handleMuteToggle = () => {
		const video = videoRef.current
		if (video) {
			const newMutedState = !isMuted
			video.muted = newMutedState
			setIsMuted(newMutedState)
			if (newMutedState) {
				// Store current volume before muting
				video.volume = 0
				setVolume(0)
			} else {
				// Restore volume to previous level or default to 1
				video.volume = volume || 1
				setVolume(video.volume)
			}
		}
	}

	const isNumber = (value: unknown): value is number =>
		typeof value === "number" && !isNaN(value) && isFinite(value)

	return (
		<div className="flex flex-col self-center rounded-xl max-w-[960px] relative w-full">
			{isFetching ||
				(isLoading && !isPlaying && (
					<div className="absolute inset-0 flex items-center justify-center">
						<Loader2 className="text-green-500 animate-spin" size={48} />
					</div>
				))}

			<div className="relative bg-violet-300 h-[500px] flex justify-center w-full">
				<Image
					loading="lazy"
					src={
						typeof trackDetails?.artwork === "string"
							? trackDetails.artwork
							: VINYL_RECORD
					}
					alt="Preview artwork"
					width={100}
					height={100}
					className={`object-contain ${trackDetails?.artwork ? "w-full z-10" : "rotate-animation"}`}
				/>
				<div
					className="absolute inset-0 bg-cover bg-center blur-md"
					style={{ backgroundImage: `url(${trackDetails?.artwork})` }}
				></div>
				<div className="absolute top-0 h-full w-full right-0 z-20">
					<video
						ref={videoRef}
						className={`w-full h-[500px] rounded-xl ${trackId?.mediaType === "audio" ? "opacity-0" : "opacity-100"}`}
						src={
							url ||
							trackDetails?.url ||
							trackId?.file ||
							trackId?.url ||
							trackId?.fileUrl ||
							""
						}
						controls={false}
						preload="metadata"
						onCanPlay={() => {
							setIsLoading(false)
							handleLoadedMetadata()
						}}
					/>
				</div>
			</div>
			<div className="flex items-center justify-between p-4 absolute bottom-0 w-full z-20 bg-black/50 backdrop-blur-sm">
				<div className="flex gap-6 items-center flex-1 min-w-0">
					<button
						onClick={handlePlayPause}
						type="button"
						className="text-white hover:text-green-400 transition-colors"
					>
						{isPlaying ? <Pause /> : <Play />}
					</button>
					<div className="text-white text-sm">
						{currentTime}{" "}
						{isNumber(duration) || trackId?.duration
							? `/ ${(trackId?.duration / 100).toFixed(2)}`
							: null}
					</div>
					<div
						ref={progressRef}
						className="flex flex-1 min-w-0 overflow-hidden bg-white/20 rounded-sm cursor-pointer"
						onMouseDown={handleProgressMouseDown}
						onMouseMove={handleProgressMouseMove}
						onMouseUp={handleProgressMouseUp}
					>
						<div
							className="h-2 bg-green-500 rounded-sm"
							style={{ width: `${progress}%` }}
						/>
					</div>
				</div>

				<div className="flex items-center gap-2 ml-4">
					<div
						onClick={handleMuteToggle}
						className="cursor-pointer text-white hover:text-green-400 transition-colors"
					>
						{isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
					</div>
					<input
						type="range"
						min="0"
						max="1"
						step="0.1"
						value={volume}
						onChange={handleVolumeChange}
						className="w-24 accent-green-500"
					/>
				</div>

				<div
					className="cursor-pointer ml-4 text-white hover:text-green-400 transition-colors"
					onClick={toggleFullScreen}
				>
					<Image
						loading="lazy"
						src={MEDIA_PREVIEW}
						alt="Full screen view"
						width={24}
						height={24}
					/>
				</div>
			</div>
		</div>
	)
}

export default MediaPlayer
