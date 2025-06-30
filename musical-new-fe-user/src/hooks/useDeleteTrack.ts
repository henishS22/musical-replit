import { toast } from "react-toastify"

import { deleteTrack } from "@/app/api/mutation"
import {
	TRACK_DELETED_FAILED,
	TRACK_DELETED_SUCCESSFULLY
} from "@/constant/toastMessages"
import { useMutation } from "@tanstack/react-query"

import { useModalStore } from "@/stores"

import useMediaList from "./useMediaList"

const useDeleteTrack = () => {
	const { fetchMediaDataList } = useMediaList()
	const { setCustomModalLoading, hideCustomModal } = useModalStore()

	const { mutate: mutateDeleteTrack, isPending: isLoading } = useMutation({
		mutationFn: (payload: string) => {
			setCustomModalLoading(true)
			return deleteTrack(payload)
		},
		onSuccess: (data) => {
			if (data) {
				toast.success(TRACK_DELETED_SUCCESSFULLY)
				fetchMediaDataList()
				setCustomModalLoading(false)
				hideCustomModal()
			}
		},
		onError: (error: Error) => {
			setCustomModalLoading(false)
			if (error instanceof Error) {
				toast.error("Error: " + error.message)
			} else {
				toast.error(TRACK_DELETED_FAILED)
			}
		}
	})

	return {
		mutateDeleteTrack,
		isLoading
	}
}

export default useDeleteTrack
