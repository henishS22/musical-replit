"use client"

import { useState } from "react"

import { STARS_ICON } from "@/assets"
import { CreativeAgentModal } from "@/components/dashboard/create-module/creative-agent-modal"
import { resetModalStepsTo, updateModalStep } from "@/helpers/modalStepHelpers"

import { useDynamicStore } from "@/stores"
import {
	GenerateMediaPayload,
	useGenerateMedia
} from "@/hooks/useGenerateMedia"

const Visuals = () => {
	const { addState, modalSteps } = useDynamicStore()
	const [selectedAction, setSelectedAction] = useState<
		"modify" | "regenerate" | "generate"
	>()

	const { generateMediaContent, isPending } = useGenerateMedia({
		onSuccess: (data) => {
			if (data) {
				addState("generatedVideo", data?.url)
				addState("audioFile", data?.file)
				if (modalSteps === 2) {
					resetModalStepsTo(1)
					setSelectedAction("generate")
					updateModalStep(modalSteps - 1)
				} else {
					updateModalStep(modalSteps + 1)
				}
			}
		}
	})

	const handleGenerateMedia = (
		file: File | null,
		type: string,
		prompt: string
	) => {
		if (!prompt.trim()) return

		const payload: GenerateMediaPayload = {
			// Define the payload object
			prompt,
			media_type: type,
			file: file || undefined
		}

		if (selectedAction === "modify") {
			payload.use_previous_video = true
			// payload.regenerate = true
		} else if (selectedAction === "regenerate") {
			payload.regenerate = true
		}
		generateMediaContent(payload)
	}

	const stepComponents = [
		<CreativeAgentModal
			key="generate"
			onComplete={handleGenerateMedia}
			title="Make a compelling video from text, images, audio and video sources. Use for a music video or everyday social content."
			description=""
			icon={STARS_ICON}
			iconBgColor="#E8FAF0"
			placeholder="Type some text or add an image/video"
			inputIcon={{
				type: "combined"
			}}
			isLoading={isPending}
			mediaType="video"
			overlayModal
			overlayType="circular"
		/>,
		<CreativeAgentModal key="choose" visualsStep={1} />,
		<CreativeAgentModal
			visualsStep={2}
			key="preview"
			placeholder="Describe your change"
			inputIcon={{
				type: "attachment"
			}}
			selectedAction={selectedAction}
			setSelectedAction={setSelectedAction}
			onComplete={(file, type, prompt) =>
				handleGenerateMedia(file, type, prompt)
			}
			isLoading={isPending}
			mediaType="video"
			overlayModal
			overlayType="circular"
		/>,
		<CreativeAgentModal visualsStep={3} key="preview" />
	]

	return stepComponents[modalSteps]
}

export default Visuals
