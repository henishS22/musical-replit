"use client"

import { useEffect, useRef, useState } from "react"

import { AudioVisualizer } from "@/components/dashboard/create-module/audio-visualizer"
import {
	SpeechRecognition,
	SpeechRecognitionEvent,
	Window
} from "@/types/workWithAiTypes"
import { Button } from "@nextui-org/react"
import { Mic, MicOff, X } from "lucide-react"

const VoiceModal = ({
	onTranscriptChange,
	onClose
}: {
	onTranscriptChange: (transcript: string) => void
	onClose: () => void
}) => {
	const [isListening, setIsListening] = useState(true)
	const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)
	const [transcript, setTranscript] = useState("")
	const [hasPermission, setHasPermission] = useState<boolean | null>(null)
	const recognitionRef = useRef<SpeechRecognition | null>(null)
	const [isBrowserSupported, setIsBrowserSupported] = useState(true)

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

	const checkBrowserSupport = () => {
		const SpeechRecognition =
			(window as unknown as Window).SpeechRecognition ||
			(window as unknown as Window).webkitSpeechRecognition
		return !!SpeechRecognition
	}

	useEffect(() => {
		checkPermission()

		const isSupported = checkBrowserSupport()
		setIsBrowserSupported(isSupported)

		if (!isSupported) {
			console.warn("Speech recognition is not supported in this browser.")
			return
		}

		const SpeechRecognition =
			(window as unknown as Window).SpeechRecognition ||
			(window as unknown as Window).webkitSpeechRecognition
		if (!SpeechRecognition) {
			console.warn("Speech recognition is not supported in this browser.")
			setHasPermission(false)
			return
		}
		recognitionRef.current = new SpeechRecognition()
		recognitionRef.current.continuous = true
		recognitionRef.current.interimResults = true

		recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
			let fullTranscript = ""
			for (let i = 0; i < event.results.length; i++) {
				fullTranscript += event.results[i][0].transcript + " "
			}
			const transcript = fullTranscript.trim()
			setTranscript(transcript)
		}

		if (hasPermission && isBrowserSupported) {
			startListening()
		}

		return () => {
			if (recognitionRef.current) {
				recognitionRef.current.stop()
			}
			if (mediaStream) {
				mediaStream.getTracks().forEach((track) => track.stop())
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hasPermission])

	const startListening = async () => {
		if (!hasPermission || !recognitionRef.current) return

		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
			setMediaStream(stream)
			setIsListening(true)
			recognitionRef.current.start()
		} catch (error) {
			console.error("Error accessing microphone:", error)
		}
	}

	const stopListening = () => {
		if (recognitionRef.current) {
			recognitionRef.current.stop()
		}
		if (mediaStream) {
			mediaStream.getTracks().forEach((track) => track.stop())
		}
		setMediaStream(null)
		setIsListening(false)
	}

	const handleClose = () => {
		if (transcript) {
			onTranscriptChange(transcript)
		}
		stopListening()
		onClose()
	}

	return (
		<div className="flex flex-col items-center justify-center p-8">
			<div className="text-center mb-[47px]">
				<h2 className="text-xl font-semibold">
					{isListening ? "Listening..." : "Tap the microphone to try again..."}
				</h2>
			</div>

			<div
				className={`relative w-full max-w-md flex mb-[47px] items-center justify-center ${!isListening && "mt-[47px]"}`}
			>
				{isListening && (
					<AudioVisualizer
						mediaStream={mediaStream}
						navigationState={1}
						isPaused={false}
						gradient={true}
					/>
				)}
			</div>

			{!hasPermission && (
				<p className="text-sm text-red-500">
					Please allow microphone access to use this feature
				</p>
			)}

			<div className="flex gap-4">
				<Button
					isIconOnly
					className={`w-[45px] h-[45px] text-white rounded-full ${
						isListening
							? "bg-gradient-to-b from-[#1DB954] to-[#0D5326]"
							: "bg-[#EF4444]"
					}`}
					onPress={isListening ? stopListening : startListening}
					isDisabled={!hasPermission || !isBrowserSupported}
				>
					{isListening ? <Mic size={28} /> : <MicOff size={28} />}
				</Button>
				<Button
					isIconOnly
					className="w-[45px] h-[45px] text-white rounded-full"
					onPress={handleClose}
				>
					<X size={24} />
				</Button>
			</div>

			{transcript && (
				<div className="w-full max-w-md p-4 bg-gray-100 rounded-lg mt-4">
					<p className="text-sm">{transcript}</p>
				</div>
			)}
		</div>
	)
}

export default VoiceModal
