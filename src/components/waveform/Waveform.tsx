"use client"

import { memo, useEffect, useRef } from "react"

import WaveSurfer from "wavesurfer.js"

interface AudioWaveProps {
	audioUrl: string
	isPlaying: boolean
	onPlay: () => void
	onPause: () => void
	onDuration: (duration: number) => void
	isMuted?: boolean
}

export const Waveform = memo(
	({
		audioUrl,
		isPlaying,
		onPlay,
		onPause,
		onDuration,
		isMuted
	}: AudioWaveProps) => {
		const containerRef = useRef<HTMLDivElement | null>(null)
		const waveSurferRef = useRef<WaveSurfer | null>(null)
		const isInitializedRef = useRef(false)

		useEffect(() => {
			if (audioUrl && containerRef.current && !isInitializedRef.current) {
				const waveSurfer = WaveSurfer.create({
					container: containerRef.current,
					waveColor: "#E6E6E6",
					progressColor: "#398FFF",
					height: 46,
					backend: "WebAudio",
					normalize: true
				})

				waveSurfer.load(audioUrl)

				waveSurfer.on("ready", () => {
					onDuration(waveSurfer.getDuration())
					isInitializedRef.current = true
				})

				waveSurfer.on("finish", () => {
					onPause()
					waveSurfer.seekTo(0)
				})

				waveSurferRef.current = waveSurfer

				return () => {
					if (waveSurferRef.current) {
						waveSurfer.destroy()
						waveSurferRef.current.pause()
						waveSurferRef.current.seekTo(0)
						isInitializedRef.current = false
					}
				}
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [audioUrl])

		// Handle play/pause
		useEffect(() => {
			const waveSurfer = waveSurferRef.current
			if (!waveSurfer || !isInitializedRef.current) return

			if (isPlaying) {
				waveSurfer.play()
				onPlay()
			} else {
				waveSurfer.pause()
				onPause()
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [isPlaying])

		// Handle mute/unmute
		useEffect(() => {
			const waveSurfer = waveSurferRef.current
			if (!waveSurfer || !isInitializedRef.current) return

			waveSurfer.setVolume(isMuted ? 0 : 1)
			if (isMuted) {
				waveSurfer.setMuted(true)
			}
		}, [isMuted])

		return <div ref={containerRef} className="flex-1"></div>
	}
)
Waveform.displayName = "Waveform"
