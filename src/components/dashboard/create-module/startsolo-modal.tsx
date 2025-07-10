"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

import CustomModal from "@/components/modal/CustomModal"
import { START_SOLO_MODAL } from "@/constant/modalType"
import {
	Button,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
	ModalContent
} from "@nextui-org/react"
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"

import { useModalStore } from "@/stores"

import { ArtworkModal } from "./artwork-modal"
import { Microphone } from "./microphone"
import { RecordingModal } from "./recording-modal"
import { VideoModal } from "./video-modal"

interface StartSoloModalProps {
	initialKey: string
	onBack: () => void
}

interface RecordingData {
	file?: Blob
}

export function StartSoloModal({ initialKey, onBack }: StartSoloModalProps) {
	const { hideCustomModal, customModalType } = useModalStore()
	// const { generatedImage, addState, trackId } = useDynamicStore()
	const [dropdownValue, setDropdownValue] = useState<string>("")
	const [navigationState, setNavigationState] = useState<number>(0)
	const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined)
	const [recordingData, setRecordingData] = useState<RecordingData | undefined>(
		undefined
	)
	const { id } = useParams()

	// const { generateMediaContent, isPending: isLoadingGenerateImage } =
	// 	useGenerateMedia({
	// 		onSuccess: (data: { url: string; file: Blob }) => {
	// 			addState("generatedImage", data?.url)
	// 			handleUpdateTrack(data?.file)
	// 		},
	// 		onError: (error: Error) => {
	// 			toast.error(
	// 				error instanceof Error ? error.message : "An unknown error occurred."
	// 			)
	// 		}
	// 	})

	// const { mutate: updateTrackImg, isPending: isUpdateTrack } = useMutation({
	// 	mutationFn: (val: FormData) => updateTrack(trackId?.id as string, val),
	// 	onSuccess: (data) => {
	// 		if (data) {
	// 			handleNavigation(4)
	// 		}
	// 	},
	// 	onError: (error: Error) => {
	// 		toast.error(
	// 			error instanceof Error ? error.message : "An unknown error occurred."
	// 		)
	// 	}
	// })

	// const handleSubmit = (type: string, message: string) => {
	// 	if (!message.trim()) return
	// 	generateMediaContent({
	// 		prompt: message,
	// 		media_type: type
	// 	})
	// }

	// const handleUpdateTrack = (file: Blob) => {
	// 	const formData = new FormData()
	// 	if (file) {
	// 		formData.append("artwork", file)
	// 	}
	// 	const uniqueName = `recording_${new Date().toISOString()}.mp3`
	// 	formData.append("name", uniqueName)
	// 	updateTrackImg(formData)
	// }

	const handleRecordingComplete = (url: string, audioBlob: Blob) => {
		setRecordingData({
			file: audioBlob
		})
		setAudioUrl(url)
	}

	useEffect(() => {
		setNavigationState(0)
	}, [dropdownValue])

	useEffect(() => {
		if (customModalType === START_SOLO_MODAL && initialKey) {
			setDropdownValue(initialKey)
			setNavigationState(0)
		}
	}, [initialKey, customModalType])

	useEffect(() => {
		if (customModalType !== START_SOLO_MODAL) {
			setDropdownValue("")
			setNavigationState(0)
		}
	}, [customModalType])

	const getDropdownLabel = (value: string): string => {
		switch (value) {
			case "mic":
				return "Use Microphone"
			case "camera":
				return "Use Camera"
			case "upload":
				return "Upload Options"
			default:
				return value ? getDropdownLabel(value) : "Use Microphone"
		}
	}

	const handleNavigation = (key: number) => {
		setNavigationState(key)
	}

	const handleBack = () => {
		if (navigationState > 0) {
			if (dropdownValue === "mic" && navigationState == 2) {
				setNavigationState(0)
			} else {
				setNavigationState(navigationState - 1)
			}
		} else {
			onBack() // Navigate back to the parent modal
		}
	}

	const renderContent = () => {
		if (dropdownValue === "mic") {
			switch (navigationState) {
				case 0:
					return (
						<Microphone
							navigationState={navigationState}
							handleRecordingComplete={handleRecordingComplete}
							handleNavigation={handleNavigation}
						/>
					)
				case 1:
					return (
						<Microphone
							navigationState={navigationState}
							handleRecordingComplete={handleRecordingComplete}
							handleNavigation={handleNavigation}
						/>
					)
				case 2:
					return (
						<div className="p-6">
							<RecordingModal
								audioUrl={audioUrl}
								handleNavigation={handleNavigation}
								audioFile={recordingData?.file}
								// onSave={handleSaveRecording}
							/>
						</div>
					)
				// case 3:
				// 	return (
				// 		<CreativeAgentModal
				// 			icon={STARS_ICON}
				// 			onComplete={(file, type, text) => handleSubmit(type, text)}
				// 			isLoading={isLoadingGenerateImage || isUpdateTrack}
				// 			title=""
				// 		/>
				// 	)
				case 3:
					return (
						<ArtworkModal
							// artworkUrl={generatedImage}
							share
							description={
								id
									? "Add the recording to this project"
									: "Add this recording to an existing project or use it to start a new one."
							}
						/>
					)
				default:
					return null
			}
		}
		return null
	}

	return (
		<CustomModal
			modalBodyClass=""
			onClose={hideCustomModal}
			size="5xl"
			showModal={customModalType === START_SOLO_MODAL}
		>
			<ModalContent className="p-0 gap-0 bg-white shadow-lg w-[540px] max-h-screen rounded-2xl backdrop:blur">
				<div className="flex items-center p-6">
					<Button
						onPress={handleBack}
						className="min-w-0 p-2 h-auto bg-transparent hover:bg-transparent border border-[#E8ECEF] rounded-sm"
					>
						<ChevronLeft className="w-5 h-5 text-gray-600" />
					</Button>
					<div className="flex items-center gap-2 ml-2">
						<span className="text-sm font-normal text-textPrimary">
							Start Solo
						</span>
						<ChevronRight className="w-4 h-4" />
						<div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F4F4F4]">
							<Dropdown>
								<DropdownTrigger flat>
									<div className="flex items-center gap-2">
										<p>{getDropdownLabel(dropdownValue)}</p>
										<ChevronDown className="w-4 h-4 text-textGray" />
									</div>
								</DropdownTrigger>
								<DropdownMenu
									aria-label="Options"
									variant="shadow"
									selectionMode="single"
									selectedKeys={new Set([dropdownValue])}
									disabledKeys={new Set([])}
									onSelectionChange={(keys) => {
										const key = Array.from(keys).join("")
										setDropdownValue(key)
									}}
								>
									<DropdownItem key="mic">Use Microphone</DropdownItem>
									<DropdownItem key="camera">Use Camera</DropdownItem>
									{/* <DropdownItem key="upload">Upload Options</DropdownItem> */}
								</DropdownMenu>
							</Dropdown>
						</div>
					</div>
				</div>
				{renderContent()}
				{/* Conditionally render content */}
				{/* {dropdownValue === "mic" && 
				<Microphone onOpenChange={hideCustomModal} />} */}
				{dropdownValue === "camera" && <VideoModal />}
			</ModalContent>
		</CustomModal>
	)
}
