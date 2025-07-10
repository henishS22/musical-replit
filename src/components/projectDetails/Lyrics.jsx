import { useParams } from "next/navigation"

import { VIEW_LYRICS_MODAL } from "@/constant/modalType"

import { useDynamicStore, useModalStore, useUserStore } from "@/stores"

const Lyrics = () => {
	const { showCustomModal } = useModalStore()
	const { projectData } = useDynamicStore()
	const { userData } = useUserStore()
	const params = useParams()
	const projectId = params?.id
	return (
		<div className="flex flex-col py-4 pr-3.5 pl-4 mt-4 w-full rounded-lg border-2 border-solid border-neutral-100">
			<div className="gap-4 self-start text-sm font-bold tracking-normal leading-6 whitespace-nowrap text-zinc-900">
				Lyrics
			</div>
			<div
				className="flex gap-3 items-start mt-3 flex-wrap text-sm text-green-500 font-bold cursor-pointer"
				onClick={() => {
					showCustomModal({
						customModalType: VIEW_LYRICS_MODAL,
						tempCustomModalData: {
							projectId: projectId,
							userId: userData?._id,
							LyricsId: projectData?.lyrics?._id
						}
					})
				}}
			>
				View Lyrics
			</div>
		</div>
	)
}

export default Lyrics
