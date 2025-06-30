"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

import { SCHEDULE_POST_MODAL } from "@/constant/modalType"
import { checkIfMovFileHasVideo } from "@/helpers"
import { Track } from "@/types/mediaTableTypes"

import { useDynamicStore, useModalStore } from "@/stores"
import { useMediaPlayer } from "@/hooks/useMediaPlayer"

import AdditionalControls from "./AdditionalControls"
import AudioControls from "./AudioControls"
import TrackInfo from "./TrackInfo"
import VideoPlayerView from "./VideoPlayer"

export function MediaPlayer() {
	const [mediaError, setMediaError] = useState<string | null>(null)
	const { addState, removeState, schedulePostData } = useDynamicStore()
	const { showCustomModal } = useModalStore()
	const { mediaPlayer } = useDynamicStore()
	const router = useRouter()
	const {
		audioRef,
		videoRef,
		isPlaying,
		currentTime,
		duration,
		volume,
		speed,
		isVideoMode,
		isLoading,
		error,
		controls
	} = useMediaPlayer()
	const previousTrackId = useRef<string | null>(null)

	const handleShare = (item: Track) => {
		addState("trackId", item)
		addState("isShare", false)
		if (!schedulePostData?.isSchedulePost) {
			removeState("chips")
			router.push("/post-audio-or-video")
		} else {
			showCustomModal({
				customModalType: SCHEDULE_POST_MODAL,
				tempCustomModalData: item
			})
		}
	}

	// function to dispatch media events
	const dispatchMediaEvent = (
		eventName: string,
		details: {
			duration?: number
			isVideo?: boolean
			currentTime?: number
			previousTime?: number
			newTime?: number
			seekAmount?: number
			autoplay?: boolean
		}
	) => {
		document.dispatchEvent(
			new CustomEvent(eventName, {
				detail: {
					trackId: mediaPlayer?.item?._id,
					currentTime,
					duration,
					...details
				}
			})
		)
	}

	// useEffect to handle media loading
	useEffect(() => {
		const audioElement = audioRef.current
		const videoElement = videoRef.current

		const handleError = (e: ErrorEvent) => {
			console.error("Media error:", e)
			setMediaError("Error loading media. Please try again later.")
		}

		const handleLoadedData = () => {
			dispatchMediaEvent("media-loaded", {
				duration: mediaPlayer?.duration,
				isVideo: isVideoMode,
				currentTime: 0
			})
		}

		audioElement?.addEventListener("error", handleError)
		videoElement?.addEventListener("error", handleError)
		audioElement?.addEventListener("loadeddata", handleLoadedData)
		videoElement?.addEventListener("loadeddata", handleLoadedData)

		return () => {
			audioElement?.removeEventListener("error", handleError)
			videoElement?.removeEventListener("error", handleError)
			audioElement?.removeEventListener("loadeddata", handleLoadedData)
			videoElement?.removeEventListener("loadeddata", handleLoadedData)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [audioRef, videoRef, mediaPlayer?.duration, isVideoMode])

	//useEffect to handle video mode toggling
	useEffect(() => {
		if (mediaPlayer) {
			const currentMediaElement = isVideoMode
				? videoRef.current
				: audioRef.current
			const previousMediaElement = isVideoMode
				? audioRef.current
				: videoRef.current

			if (currentMediaElement && previousMediaElement) {
				// Store the current playback state
				const wasPlaying = !previousMediaElement.paused
				const currentTime = previousMediaElement.currentTime

				// Pause the previous media element
				previousMediaElement.pause()

				// Set up the new media element
				currentMediaElement.currentTime = currentTime

				if (wasPlaying) {
					// Resume playback on the new media element
					currentMediaElement
						.play()
						.then(() => {
							if (!isPlaying) {
								controls.togglePlay()
							}
						})
						.catch((e) => console.error("Error resuming playback:", e))
				}
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isVideoMode])

	// useEffect to handle track change
	useEffect(() => {
		if (mediaPlayer) {
			// If startTime is provided, seek to that position
			if (mediaPlayer.startTime !== undefined) {
				controls.seek(mediaPlayer.startTime)
			} else {
				controls.seek(0)
			}

			const isMov = mediaPlayer.extension === "quicktime"

			if (isMov && mediaPlayer?.videoUrl) {
				checkIfMovFileHasVideo(mediaPlayer.videoUrl).then((hasVideo) => {
					if (hasVideo !== isVideoMode) {
						controls.toggleVideoMode()
					}
				})
			} else {
				const isNewTrackVideo = mediaPlayer.extension === "video"
				if (isNewTrackVideo !== isVideoMode) {
					controls.toggleVideoMode()
				}
			}

			// always play on track change
			setTimeout(() => {
				const mediaElement =
					mediaPlayer.extension === "video" ||
					mediaPlayer.extension === "quicktime"
						? videoRef.current
						: audioRef.current
				if (mediaElement) {
					mediaElement
						.play()
						.then(() => {
							if (!isPlaying) {
								controls.togglePlay()
							}
							// dispatch media-played event with initial state
							dispatchMediaEvent("media-played", {
								isVideo: isVideoMode,
								autoplay: true,
								duration: mediaPlayer.duration
							})
						})
						.catch((e) => console.error("Playback failed:", e))
				}
			}, 0)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mediaPlayer?.audioUrl, mediaPlayer?.videoUrl])

	// useEffect to handle timeupdate for audio/video elements
	useEffect(() => {
		const handleTimeUpdate = () => {
			const mediaElement = isVideoMode ? videoRef.current : audioRef.current
			if (mediaElement) {
				dispatchMediaEvent("media-timeupdate", {
					isVideo: isVideoMode,
					currentTime: mediaElement.currentTime,
					duration: mediaElement.duration
				})
			}
		}

		const audioElement = audioRef.current
		const videoElement = videoRef.current

		audioElement?.addEventListener("timeupdate", handleTimeUpdate)
		videoElement?.addEventListener("timeupdate", handleTimeUpdate)

		return () => {
			audioElement?.removeEventListener("timeupdate", handleTimeUpdate)
			videoElement?.removeEventListener("timeupdate", handleTimeUpdate)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isVideoMode])

	// useEffect to handle track player controls
	useEffect(() => {
		const handleTrackPlayerPlay = (e: Event) => {
			const customEvent = e as CustomEvent
			if (mediaPlayer?.item?._id === customEvent.detail.trackId) {
				controls.togglePlay()
				dispatchMediaEvent("media-played", {
					isVideo: isVideoMode,
					currentTime: customEvent.detail.currentTime
				})
			}
		}

		const handleTrackPlayerPause = (e: Event) => {
			const customEvent = e as CustomEvent
			if (mediaPlayer?.item?._id === customEvent.detail.trackId) {
				controls.togglePlay()
				dispatchMediaEvent("media-paused", {
					isVideo: isVideoMode,
					currentTime: customEvent.detail.currentTime
				})
			}
		}

		document.addEventListener("track-player-play", handleTrackPlayerPlay)
		document.addEventListener("track-player-pause", handleTrackPlayerPause)

		return () => {
			document.removeEventListener("track-player-play", handleTrackPlayerPlay)
			document.removeEventListener("track-player-pause", handleTrackPlayerPause)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mediaPlayer?.item?._id, isVideoMode, controls])

	// for closing the MediaPlayer
	const handleClose = () => {
		if (mediaPlayer?.item?._id) {
			removeState("mediaPlayer")
			document.dispatchEvent(
				new CustomEvent("media-player-closed", {
					detail: {
						trackId: mediaPlayer.item._id
					}
				})
			)
			document.dispatchEvent(
				new CustomEvent("track-changed", {
					detail: {
						previousTrackId: mediaPlayer.item._id,
						newTrackId: null
					}
				})
			)
		}
		removeState("mediaPlayer")
	}

	// when changing tracks
	const handleTrackChange = (newTrack: Track) => {
		document.dispatchEvent(
			new CustomEvent("track-changed", {
				detail: {
					previousTrackId: mediaPlayer?.item?._id,
					newTrackId: newTrack._id
				}
			})
		)
	}

	// when the media player state changes (through addState)
	useEffect(() => {
		if (mediaPlayer?.item?._id) {
			// if there was a previous track, dispatch track change event
			if (
				previousTrackId.current &&
				previousTrackId.current !== mediaPlayer.item._id
			) {
				handleTrackChange(mediaPlayer.item)
			}
			// update the previous track ID reference
			previousTrackId.current = mediaPlayer.item._id
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mediaPlayer])

	const handlePlayPause = () => {
		controls.togglePlay()
		dispatchMediaEvent(isPlaying ? "media-paused" : "media-played", {
			isVideo: isVideoMode
		})
	}

	if (error || mediaError) {
		return (
			<div className="fixed bottom-0 left-0 right-0 bg-red-500/90 p-4 text-center text-white z-50">
				{error || mediaError}
			</div>
		)
	}

	return (
		<div className="fixed bottom-0 left-0 right-0 bg-black/90 text-white backdrop-blur-md z-[999]">
			{/* Video Player */}
			<VideoPlayerView
				audioRef={audioRef}
				controls={controls}
				isLoading={isLoading}
				isVideoMode={isVideoMode}
				videoRef={videoRef}
				handleClose={handleClose}
				mediaPlayer={mediaPlayer}
			/>

			{/* Controls */}
			<div className="mx-auto flex max-w-7xl items-center gap-4 p-4">
				{/* Album Art & Info */}
				<TrackInfo mediaPlayer={mediaPlayer} />

				{/* Player Controls & Progress */}
				<AudioControls
					mediaPlayer={mediaPlayer}
					isPlaying={isPlaying}
					currentTime={currentTime}
					duration={duration}
					controls={controls}
					isLoading={isLoading}
					handlePlayPause={handlePlayPause}
				/>

				{/* Additional Controls */}
				<AdditionalControls
					volume={volume}
					speed={speed}
					controls={controls}
					handleClose={handleClose}
					handleShare={handleShare}
					isVideoMode={isVideoMode}
					mediaPlayer={mediaPlayer}
				/>
			</div>
		</div>
	)
}
