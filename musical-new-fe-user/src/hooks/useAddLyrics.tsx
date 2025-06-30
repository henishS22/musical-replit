import { toast } from "react-toastify"

import { addLyrics } from "@/app/api/mutation"
import { useMutation } from "@tanstack/react-query"

interface UseAddLyricsProps {
	onSuccess?: (data: Record<string, string>) => void
	onError?: (error: Error) => void
}

export function useAddLyrics({ onSuccess, onError }: UseAddLyricsProps = {}) {
	return useMutation({
		mutationFn: (lines: Record<string, string>) => addLyrics(lines),
		onSuccess: (data) => {
			if (data) {
				if (onSuccess) onSuccess(data)
			}
		},
		onError: (error: Error) => {
			toast.error(error.message)
			if (onError) onError(error)
		}
	})
}
