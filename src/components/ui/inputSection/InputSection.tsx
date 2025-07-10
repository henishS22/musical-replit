"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "react-toastify"
import Image from "next/image"

import { UP_ARROW_ICON } from "@/assets"
import { CustomInput } from "@/components/ui/customInput"
import SelectedFile from "@/components/ui/SelectedFile"
import { InputSectionProps } from "@/types/workWithAiTypes"
import { Button, Spinner } from "@nextui-org/react"
import { Mic, MicOff, Paperclip } from "lucide-react"

export function InputSection({
	isDisabled,
	placeholder,
	inputIcon,
	onComplete,
	mediaType,
	isInvalid,
	defaultValue,
	disabled
}: InputSectionProps) {
	const [message, setMessage] = useState("")
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [isRecording, setIsRecording] = useState(false)
	const websocketRef = useRef<WebSocket | null>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const mediaStreamRef = useRef<MediaStream | null>(null)
	const audioContextRef = useRef<AudioContext | null>(null)
	const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null)
	const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null)

	const toggleRecording = useCallback(() => {
		if (isRecording) {
			stopRecording()
		} else {
			startRecording()
		}
	}, [isRecording])

	const getIcon = useMemo(() => {
		switch (inputIcon?.type) {
			case "combined":
				return (
					<div className="flex items-center gap-2">
						<Paperclip
							className="w-5 h-5"
							onClick={() => fileInputRef.current?.click()}
						/>
						<input
							type="file"
							ref={fileInputRef}
							className="hidden"
							accept="image/*,video/*"
							multiple
							onChange={(e) => {
								const files = e.target.files
								if (files && files[0]) {
									setSelectedFile(files[0])
									inputIcon.onAttachmentClick?.()
								}
							}}
						/>
						{isRecording ? (
							<Mic className="w-5 h-5" onClick={toggleRecording} />
						) : (
							<MicOff className="w-5 h-5" onClick={toggleRecording} />
						)}
					</div>
				)
			case "attachment":
				return (
					<>
						<Paperclip
							className="w-5 h-5"
							onClick={() => fileInputRef.current?.click()}
						/>
						<input
							type="file"
							ref={fileInputRef}
							className="hidden"
							accept="image/*,video/*"
							onChange={(e) => {
								const files = e.target.files
								if (files && files[0]) {
									setSelectedFile(files[0])
									inputIcon.onAttachmentClick?.()
								}
							}}
						/>
					</>
				)
			case "mic":
				return isRecording ? (
					<Mic className="w-5 h-5" onClick={toggleRecording} />
				) : (
					<MicOff className="w-5 h-5" onClick={toggleRecording} />
				)
			default:
				return null
		}
	}, [inputIcon, isRecording, toggleRecording])

	const startRecording = async () => {
		try {
			// Request microphone access
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: {
					echoCancellation: true,
					noiseSuppression: true,
					sampleRate: 16000
				}
			})

			// Create audio context
			const audioContext = new AudioContext({ sampleRate: 16000 })
			audioContextRef.current = audioContext

			// Load audio worklet module
			await audioContext.audioWorklet.addModule("/audio-processor.js")

			// Create audio worklet node
			const audioWorkletNode = new AudioWorkletNode(
				audioContext,
				"pcm-int16-processor"
			)
			audioWorkletNodeRef.current = audioWorkletNode

			// Setup WebSocket
			const websocket = new WebSocket(
				`${process.env.NEXT_PUBLIC_SPEECH_TO_TEXT_URL!}/transcribe`
			)
			websocket.binaryType = "arraybuffer"
			websocketRef.current = websocket

			websocket.onopen = () => {}
			websocket.onerror = () => {
				toast.error("WebSocket connection failed")
			}
			websocket.onmessage = (event) => {
				if (event.data) {
					setMessage((prev) => prev + " " + event.data)
				}
			}

			// Handle audio worklet messages
			audioWorkletNode.port.onmessage = (event) => {
				if (
					event.data?.type === "audio-chunk" &&
					websocket.readyState === WebSocket.OPEN
				) {
					websocket.send(event.data.chunk)
				}
			}

			// Create source node from media stream
			const sourceNode = audioContext.createMediaStreamSource(stream)
			sourceNodeRef.current = sourceNode

			// Connect nodes
			sourceNode.connect(audioWorkletNode)
			audioWorkletNode.connect(audioContext.destination)

			// Store stream reference
			mediaStreamRef.current = stream

			// Update state
			setIsRecording(true)
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Could not start recording"
			)
		}
	}

	const stopRecording = () => {
		try {
			mediaStreamRef.current?.getTracks().forEach((track) => track.stop())
			websocketRef.current?.close()
			sourceNodeRef.current?.disconnect()
			audioWorkletNodeRef.current?.disconnect()
			audioWorkletNodeRef.current?.port.postMessage("stop")
			audioContextRef.current?.close()

			setIsRecording(false)
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Could not stop recording"
			)
		}
	}

	const handleSubmit = () => {
		if (message.trim() || selectedFile) {
			onComplete(selectedFile, mediaType || "", message)
			setMessage("")
		}
	}

	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key === "Enter" && !isDisabled && message.trim()) {
			handleSubmit()
		}
	}

	useEffect(() => {
		document.addEventListener("keydown", handleKeyDown)
		return () => document.removeEventListener("keydown", handleKeyDown)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isDisabled, message])

	useEffect(() => {
		if (defaultValue) {
			setMessage(defaultValue)
		}
	}, [defaultValue])

	return (
		<div
			className={`relative flex gap-[10px] ${selectedFile ? "items-end" : "items-center"}`}
		>
			<div className="flex flex-col items-start border !border-[#D8E0F0] !rounded-2xl w-full">
				{selectedFile && (
					<SelectedFile
						selectedFile={selectedFile}
						setSelectedFile={setSelectedFile}
					/>
				)}
				<CustomInput
					wrapperClassName="flex-1 w-full"
					value={message}
					disabled={disabled}
					onChange={(e) => setMessage(e.target.value)}
					placeholder={placeholder}
					type="text"
					classname="w-full px-4 py-3 pr-[64px] !border-none !rounded-2xl focus:outline-none h-49 flex-1 !mt-0"
					endContentClassName="!top-[8px]"
					endContent={
						<div
							className={`z-10 cursor-pointer h-8 flex items-center justify-center ${isDisabled ? "opacity-50" : ""}`}
						>
							{getIcon}
						</div>
					}
					isInvalid={isInvalid}
				/>
			</div>
			<Button
				className="flex items-center gap-2 bg-[#0A1629] py-[10px] px-[10px] rounded-full cursor-pointer min-w-[44px] min-h-[44px]"
				isDisabled={isDisabled || !message.trim()}
				onPress={handleSubmit}
			>
				{!isDisabled ? (
					<Image src={UP_ARROW_ICON} alt="Send" width={18.89} height={18.88} />
				) : (
					<Spinner size="sm" color="white" />
				)}
			</Button>
		</div>
	)
}
