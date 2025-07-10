"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { PlaybackSpeed } from "@/types/media"

export function useMediaPlayer() {
	const audioRef = useRef<HTMLAudioElement | null>(null)
	const videoRef = useRef<HTMLVideoElement | null>(null)
	const [isPlaying, setIsPlaying] = useState(false)
	const [currentTime, setCurrentTime] = useState(0)
	const [duration, setDuration] = useState(0)
	const [volume, setVolume] = useState(1)
	const [speed, setSpeed] = useState<PlaybackSpeed>(1)
	const [isVideoMode, setIsVideoMode] = useState(false)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const mediaRef = isVideoMode ? videoRef : audioRef

	const togglePlay = useCallback(() => {
		if (mediaRef.current) {
			if (isPlaying) {
				mediaRef.current.pause()
			} else {
				mediaRef.current.play()
			}
			setIsPlaying(!isPlaying)
		}
	}, [isPlaying, mediaRef])

	const seek = useCallback(
		(time: number) => {
			if (mediaRef.current) {
				mediaRef.current.currentTime = time
				setCurrentTime(time)
			}
		},
		[mediaRef]
	)

	const updateVolume = useCallback(
		(value: number) => {
			if (mediaRef.current) {
				mediaRef.current.volume = value
				setVolume(value)
			}
		},
		[mediaRef]
	)

	const updateSpeed = useCallback(
		(value: PlaybackSpeed) => {
			if (mediaRef.current) {
				mediaRef.current.playbackRate = value
				setSpeed(value)
			}
		},
		[mediaRef]
	)

	const toggleVideoMode = useCallback(() => {
		if (mediaRef.current) {
			const currentTime = mediaRef.current.currentTime
			setIsVideoMode(!isVideoMode)
			// Preserve playback position when switching modes
			setTimeout(() => {
				if (mediaRef.current) {
					mediaRef.current.currentTime = currentTime
					if (isPlaying) mediaRef.current.play()
				}
			}, 0)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isPlaying, mediaRef])

	const handleTimeUpdate = useCallback(() => {
		if (mediaRef.current) {
			setCurrentTime(mediaRef.current.currentTime)
		}
	}, [mediaRef])

	const handleLoadedMetadata = useCallback(() => {
		if (mediaRef.current) {
			setDuration(mediaRef.current.duration)
			setIsLoading(false)
		}
	}, [mediaRef])

	const handleError = useCallback(() => {
		setError("Error loading media")
		setIsLoading(false)
	}, [])

	const handleEnded = useCallback(() => {
		setIsPlaying(false)
	}, [])

	const handleKeyPress = useCallback(
		(e: KeyboardEvent) => {
			if (!mediaRef.current) return

			switch (e.key.toLowerCase()) {
				case " ":
					e.preventDefault()
					togglePlay()
					break
				case "arrowleft": {
					const seekAmount = duration < 10 ? 1 : 5
					seek(Math.max(0, currentTime - seekAmount))
					break
				}
				case "arrowright": {
					const seekAmount = duration < 10 ? 1 : 5
					seek(Math.min(duration, currentTime + seekAmount))
					break
				}
				case "m":
					updateVolume(volume === 0 ? 1 : 0)
					break
			}
		},
		[currentTime, duration, seek, togglePlay, updateVolume, volume, mediaRef]
	)

	useEffect(() => {
		window.addEventListener("keydown", handleKeyPress)
		return () => window.removeEventListener("keydown", handleKeyPress)
	}, [handleKeyPress])

	useEffect(() => {
		const audioElement = audioRef.current
		const videoElement = videoRef.current

		audioElement?.addEventListener("ended", handleEnded)
		videoElement?.addEventListener("ended", handleEnded)

		return () => {
			audioElement?.removeEventListener("ended", handleEnded)
			videoElement?.removeEventListener("ended", handleEnded)
		}
	}, [handleEnded])

	// Add a new effect to handle video end detection
	useEffect(() => {
		const videoElement = videoRef.current

		const handleTimeUpdate = () => {
			if (videoElement && mediaRef.current && mediaRef.current.duration) {
				// Use mediaRef.current.duration for end detection
				if (videoElement.currentTime >= mediaRef.current.duration - 0.1) {
					setIsPlaying(false)
				}
			}
		}

		if (isVideoMode && videoElement) {
			videoElement.addEventListener("timeupdate", handleTimeUpdate)
		}

		return () => {
			if (videoElement) {
				videoElement.removeEventListener("timeupdate", handleTimeUpdate)
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isVideoMode, mediaRef.current])

	return {
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
		controls: {
			togglePlay,
			seek,
			updateVolume,
			updateSpeed,
			toggleVideoMode,
			handleTimeUpdate,
			handleLoadedMetadata,
			handleError
		}
	}
}
