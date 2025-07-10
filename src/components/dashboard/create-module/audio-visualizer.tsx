"use client"

import { useEffect, useRef } from "react"

interface AudioVisualizerProps {
	mediaStream: MediaStream | null
	navigationState: number
	isPaused: boolean
	gradient?: boolean
}

export function AudioVisualizer({
	mediaStream,
	navigationState,
	isPaused,
	gradient = false
}: AudioVisualizerProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const animationRef = useRef<number>()
	useEffect(() => {
		if (navigationState != 1 || !mediaStream || !canvasRef.current) {
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current)
			}
			return
		}

		const audioContext = new AudioContext()
		const analyser = audioContext.createAnalyser()
		const source = audioContext.createMediaStreamSource(mediaStream)

		analyser.fftSize = 32 // smaller size for fewer bars
		source.connect(analyser)

		const bufferLength = analyser.frequencyBinCount
		const dataArray = new Uint8Array(bufferLength)
		const canvas = canvasRef.current
		const ctx = canvas.getContext("2d")!

		// Function to draw rounded bars
		const drawRoundedRect = (
			ctx: CanvasRenderingContext2D,
			x: number,
			y: number,
			width: number,
			height: number,
			radius: number
		) => {
			ctx.beginPath()
			ctx.moveTo(x + radius, y)
			ctx.lineTo(x + width - radius, y)
			ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
			ctx.lineTo(x + width, y + height - radius)
			ctx.quadraticCurveTo(
				x + width,
				y + height,
				x + width - radius,
				y + height
			)
			ctx.lineTo(x + radius, y + height)
			ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
			ctx.lineTo(x, y + radius)
			ctx.quadraticCurveTo(x, y, x + radius, y)
			ctx.closePath()
			ctx.fill()
		}

		const draw = () => {
			const WIDTH = canvas.width
			const HEIGHT = canvas.height

			// Clear canvas
			ctx.clearRect(0, 0, WIDTH, HEIGHT)

			// Get audio data
			analyser.getByteFrequencyData(dataArray)

			// Draw bars
			const bars = 5 // Number of bars
			const barWidth = 5
			const barSpacing = 5
			const cornerRadius = 2 // Corner radius for rounded bars
			const centerX = WIDTH / 2
			const centerY = HEIGHT / 2
			const totalWidth = bars * barWidth + (bars - 1) * barSpacing
			let x = centerX - totalWidth / 2

			// Gradient
			const gradientColor = ctx.createLinearGradient(0, 0, 0, canvas.height)
			gradientColor.addColorStop(0, "#1DB954") // Start color
			gradientColor.addColorStop(1, "#0D5326") // End color

			ctx.fillStyle = !gradient ? "white" : gradientColor

			for (let i = 0; i < bars; i++) {
				const barHeight = isPaused
					? 10 // static height when paused
					: (dataArray[i] / 255) * HEIGHT * 0.8 // scale height dynamically
				const y = centerY - barHeight / 2

				drawRoundedRect(ctx, x, y, barWidth, barHeight, cornerRadius)

				x += barWidth + barSpacing
			}

			animationRef.current = requestAnimationFrame(draw)
		}

		draw()

		return () => {
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current)
			}
			source.disconnect()
			audioContext.close()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [navigationState, isPaused, mediaStream])

	return (
		<div className="relative flex items-center justify-center w-16 h-16">
			<canvas
				ref={canvasRef}
				width={60}
				height={60}
				className="absolute inset-0 rounded-full"
			/>
			{isPaused && (
				<div className="absolute flex items-center justify-center space-x-2 rounded-full w-16 h-16 bg-btnColor">
					{/* Pause icon (two bars) */}
					<div className="w-2 h-6 bg-white rounded-sm"></div>
					<div className="w-2 h-6 bg-white rounded-sm"></div>
				</div>
			)}
		</div>
	)
}
