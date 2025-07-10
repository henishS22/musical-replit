import { useRef, useState } from "react"
import { toast } from "react-toastify"
import { useParams } from "next/navigation"

import { deleteLyrics, updateLyrics } from "@/app/api/mutation"
import { fetchLyrics } from "@/app/api/query"
import Savebtn from "@/components/ui/savebtn/savebtn"
import { VIEW_LYRICS_MODAL } from "@/constant/modalType"
import { LYRICS_DELETED_SUCCESSFULLY } from "@/constant/toastMessages"
import { Skeleton } from "@nextui-org/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Loader2, Pencil, Trash2 } from "lucide-react"

import { useDynamicStore, useModalStore } from "@/stores"
import { useAddLyrics } from "@/hooks/useAddLyrics"

import CustomModal from "../CustomModal"

const ViewLyricsModal = () => {
	const { customModalType, hideCustomModal, tempCustomModalData } =
		useModalStore()
	const editorRef = useRef<HTMLDivElement>(null)
	const [isEditing, setIsEditing] = useState(false)
	const queryClient = useQueryClient()
	const { addState, lyricsInput } = useDynamicStore()
	const params = useParams()
	const trackId = params?.id
	const isCreation = !trackId

	const { mutate: addLyricsMutation, isPending: isAdding } = useAddLyrics({
		onSuccess: () => {
			toast.success("Lyrics added successfully")
			queryClient.invalidateQueries({ queryKey: ["lyricsDetails"] })
			// queryClient.invalidateQueries({ queryKey: ["projectTracks"] })

			if (tempCustomModalData?.projectId) {
				queryClient.invalidateQueries({
					queryKey: ["project", tempCustomModalData?.projectId]
				})
			} else {
				queryClient.invalidateQueries({ queryKey: ["trackDetails"] })
			}
			hideCustomModal()
			setIsEditing(false)
		}
	})

	const { mutate: updateLyricsMutation, isPending: isUpdating } = useMutation({
		mutationFn: ({ lines, LyricsId }: { lines: string; LyricsId: string }) =>
			updateLyrics({ title: "My Sample Song", lines }, LyricsId),
		onSuccess: () => {
			toast.success("Lyrics updated successfully")
			if (tempCustomModalData?.projectId) {
				queryClient.invalidateQueries({
					queryKey: ["project", tempCustomModalData?.projectId]
				})
			} else {
				queryClient.invalidateQueries({ queryKey: ["trackDetails"] })
			}
			queryClient.invalidateQueries({ queryKey: ["lyricsDetails"] })
			hideCustomModal()
			setIsEditing(false)
		}
	})

	const { mutate: deleteLyric, isPending: isDeleting } = useMutation({
		mutationFn: () => deleteLyrics(tempCustomModalData?.LyricsId),
		onSuccess: () => {
			toast.success(LYRICS_DELETED_SUCCESSFULLY)
			hideCustomModal()
			if (tempCustomModalData?.projectId) {
				queryClient.invalidateQueries({
					queryKey: ["project", tempCustomModalData?.projectId]
				})
			} else {
				queryClient.invalidateQueries({ queryKey: ["trackDetails"] })
			}
			queryClient.invalidateQueries({ queryKey: ["lyricsDetails"] })
		}
	})

	// Query to fetch lyrics details
	const { data: LyricsDetails, isLoading: isLyricsLoading } = useQuery({
		queryKey: ["lyricsDetails", tempCustomModalData?.LyricsId],
		queryFn: () => fetchLyrics(tempCustomModalData?.LyricsId),
		enabled:
			!!tempCustomModalData?.LyricsId && customModalType === VIEW_LYRICS_MODAL,
		staleTime: 300000
	})

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		const htmlContent = editorRef.current?.innerHTML || ""
		if (isCreation) {
			// Save to global state for later use in track creation
			addState("lyricsInput", htmlContent)
			setIsEditing(false)
			hideCustomModal()
		} else if (tempCustomModalData?.LyricsId) {
			updateLyricsMutation({
				lines: htmlContent,
				LyricsId: tempCustomModalData.LyricsId
			})
		} else {
			addLyricsMutation({
				userId: tempCustomModalData?.userId,
				...(tempCustomModalData.projectId
					? { projectId: tempCustomModalData.projectId }
					: { trackId: tempCustomModalData?.trackId }),
				title: "My Sample Song",
				lines: htmlContent
			})
		}
	}

	return (
		<CustomModal
			showModal={customModalType === VIEW_LYRICS_MODAL}
			onClose={() => {
				hideCustomModal()
				setIsEditing(false)
			}}
			title="View and Add Lyrics"
			size="3xl"
		>
			<form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6">
				<div className="flex font-bold text-base leading-6 text-textPrimary">
					View and Add Lyrics
				</div>
				<div className="flex flex-col gap-3 font-bold text-base leading-6 text-textPrimary">
					<p>Lyrics</p>
					{isCreation ? (
						<>
							{lyricsInput && !isEditing ? (
								<div className="p-1 max-h-[400px] overflow-y-auto grey-scrollbar flex justify-between items-start">
									<p
										className="font-semibold text-base leading-6 text-textPrimary leading-6"
										dangerouslySetInnerHTML={{
											__html: lyricsInput
										}}
									/>
									<span className="flex gap-2">
										<span
											onClick={() => setIsEditing(true)}
											className="cursor-pointer hover:text-blue-600"
										>
											<Pencil />
										</span>
									</span>
								</div>
							) : (
								<div className="p-1 max-h-[400px] overflow-y-auto grey-scrollbar flex flex-col items-start">
									<div
										ref={editorRef}
										contentEditable
										className="w-full border rounded-lg p-3 max-h-[150px] overflow-y-auto grey-scrollbar bg-white focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 font-semibold text-base leading-6 text-textPrimary"
										data-placeholder="Enter lyrics here..."
										dangerouslySetInnerHTML={{
											__html: isEditing && lyricsInput ? lyricsInput : ""
										}}
									/>
									<Savebtn
										isLoading={false}
										className="w-fit self-end bg-btnColor text-white px-4 py-2 rounded-lg text-[13px] hover:bg-btnColorHover leading-[24px] font-bold tracking-[-0.01em] mt-2"
										label="Save Lyrics"
										type="submit"
										onClick={() => {}}
									/>
								</div>
							)}
						</>
					) : (
						<>
							{tempCustomModalData?.LyricsId ? (
								<div className="p-1 max-h-[400px] overflow-y-auto grey-scrollbar flex justify-between items-start">
									{isLyricsLoading ? (
										<div className="w-full space-y-3">
											<Skeleton className="w-full h-4 rounded-lg" />
											<Skeleton className="w-3/4 h-4 rounded-lg" />
											<Skeleton className="w-4/5 h-4 rounded-lg" />
											<Skeleton className="w-2/3 h-4 rounded-lg" />
										</div>
									) : (
										<>
											<p
												className="font-semibold text-base leading-6 text-textPrimary leading-6"
												dangerouslySetInnerHTML={{
													__html: LyricsDetails?.lines || ""
												}}
											/>
											<span className="flex gap-2">
												<Pencil
													onClick={() => setIsEditing(!isEditing)}
													className="cursor-pointer hover:text-blue-600"
												/>
												{isDeleting ? (
													<Loader2 className="animate-spin" />
												) : (
													<Trash2
														onClick={() => deleteLyric()}
														className="cursor-pointer hover:text-red-600"
													/>
												)}
											</span>
										</>
									)}
								</div>
							) : (
								<p className="text-gray-500">No lyrics to show</p>
							)}
							{(!tempCustomModalData?.LyricsId || isEditing) && (
								<>
									<div
										ref={editorRef}
										contentEditable
										className="w-full border rounded-lg p-3 max-h-[150px] overflow-y-auto grey-scrollbar bg-white focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 font-semibold text-base leading-6 text-textPrimary"
										data-placeholder="Enter lyrics here..."
										dangerouslySetInnerHTML={{
											__html: isEditing ? LyricsDetails?.lines || "" : ""
										}}
									/>
									<Savebtn
										isLoading={isAdding || isUpdating}
										className="w-fit self-end bg-btnColor text-white px-4 py-2 rounded-lg text-[13px] hover:bg-btnColorHover leading-[24px] font-bold tracking-[-0.01em]"
										label={isEditing ? "Update Lyrics" : "Add Lyrics"}
										type="submit"
										onClick={() => {}}
									/>
								</>
							)}
						</>
					)}
				</div>
			</form>
		</CustomModal>
	)
}

export default ViewLyricsModal
