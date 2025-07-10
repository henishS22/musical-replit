"use client"

import { fetchChatBot } from "@/app/api/query"
import { STARS_ICON } from "@/assets"
import { CreativeAgentModal } from "@/components/dashboard/create-module/creative-agent-modal"
import { updateModalStep } from "@/helpers/modalStepHelpers"
import { useMutation } from "@tanstack/react-query"

import { useAIChatStore, useDynamicStore } from "@/stores"

import { ChatDisplay } from "./ChatDisplay"

const SongsAndLyrics = () => {
	const { modalSteps } = useDynamicStore()
	const { addLyrics } = useAIChatStore()

	const { mutate: sendMessage, isPending } = useMutation({
		mutationFn: (content: string) => fetchChatBot({ content }),
		onSuccess: (response) => {
			const botMessage = {
				id: Date.now().toString() + "-bot",
				content: response || "Sorry, I couldn't process that.",
				type: "bot" as const,
				timestamp: new Date().toISOString()
			}
			addLyrics(botMessage)
		},
		onError: (error: Error) => {
			console.error("Failed to get response: " + error.message)
		}
	})

	const handleSubmit = (text: string) => {
		if (text.trim()) {
			const userMessage = {
				id: Date.now().toString() + "-user",
				content: text,
				type: "user" as const,
				timestamp: new Date().toISOString()
			}
			addLyrics(userMessage)
			sendMessage(text)

			// Jump to chat display if coming from first step
			if (modalSteps === 0) {
				updateModalStep(1)
			}
		}
	}

	const stepComponents = [
		<CreativeAgentModal
			key="generate"
			title="Use your Creative Agent for song ideas and lyrics by interacting using text or voice commands."
			description=""
			icon={STARS_ICON}
			iconBgColor="#E8FAF0"
			placeholder="Type some text or add an image/video"
			inputIcon={{
				type: "mic"
			}}
			onComplete={(file, type, text) => {
				handleSubmit(text)
			}}
		/>,
		<ChatDisplay
			key="chat"
			onSendMessage={handleSubmit}
			isPending={isPending}
		/>
	]

	return stepComponents[modalSteps] || stepComponents[0]
}

export default SongsAndLyrics
