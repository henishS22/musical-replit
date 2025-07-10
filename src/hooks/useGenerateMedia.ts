import { toast } from "react-toastify"

import { generateMedia } from "@/app/api/mutation"
import { useMutation } from "@tanstack/react-query"

export interface GenerateMediaPayload {
	prompt: string
	media_type?: string
	file?: File
	use_previous_video?: boolean
	regenerate?: boolean
}

interface UseGenerateMediaProps {
	onSuccess?: (data: { url: string; file: File }) => void
	onError?: (error: Error) => void
}

export const useGenerateMedia = ({ onSuccess }: UseGenerateMediaProps = {}) => {
	const { mutate, isPending } = useMutation({
		mutationFn: (params: { payload: FormData; mediaType: string }) =>
			generateMedia(params.payload, params.mediaType),
		onSuccess: (data: { url: string; file: File }) => {
			if (data) {
				onSuccess?.(data)
			}
		},
		onError: (error: Error) => {
			toast.error(error.message)
		}
	})

	const generateMediaContent = (payload: GenerateMediaPayload) => {
		const formData = new FormData()
		if (payload.prompt) formData.append("prompt", payload.prompt)
		if (payload.media_type) formData.append("media_type", payload.media_type)
		if (payload.file) formData.append("file", payload.file)
		if (payload.use_previous_video)
			formData.append("use_previous_video", "true")
		if (payload.regenerate) formData.append("regenerate", "true")
		mutate({ payload: formData, mediaType: payload.media_type || "" })
	}

	return {
		generateMediaContent,
		isPending
	}
}
