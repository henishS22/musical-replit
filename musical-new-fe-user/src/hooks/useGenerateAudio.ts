import { toast } from "react-toastify"

import { generateAudio } from "@/app/api/mutation"
import { useMutation } from "@tanstack/react-query"

interface GenerateAudioPayload {
	prompt: string
	audio_file?: Blob
}

interface UseGenerateAudioProps {
	onSuccess?: (data: { url: string; file: Blob }) => void
	onError?: (error: Error) => void
}

export const useGenerateAudio = ({
	onSuccess,
	onError
}: UseGenerateAudioProps = {}) => {
	const { mutate, isPending } = useMutation({
		mutationFn: (payload: FormData) => generateAudio(payload),
		onSuccess: (data) => {
			if (data) {
				onSuccess?.(data)
			}
		},
		onError: (error: Error) => {
			toast.error("Failed to generate audio: " + error.message)
			onError?.(error)
		}
	})

	const generateAudioContent = (payload: GenerateAudioPayload) => {
		const formData = new FormData()
		if (payload.prompt) formData.append("prompt", payload.prompt)
		if (payload.audio_file) formData.append("audio_file", payload.audio_file)
		mutate(formData)
	}

	return {
		generateAudioContent,
		isGeneratingAudio: isPending
	}
}
