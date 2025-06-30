import { FC } from "react"

import { PROJECT_TRACKS_MODAL } from "@/constant/modalType"

import { useModalStore } from "@/stores"

import ViewProjectTracks from "../dashboard/existingProContent/ViewProjectTracks"
import CustomModal from "./CustomModal"

interface ProjectTracksModalProps {
	projectId?: string
}

const ProjectTracksModal: FC<ProjectTracksModalProps> = ({ projectId }) => {
	const { hideCustomModal, customModalType } = useModalStore()

	return (
		<CustomModal
			onClose={hideCustomModal}
			showModal={customModalType === PROJECT_TRACKS_MODAL}
			className="max-w-[600px]"
		>
			<div className="bg-white p-6 w-full max-w-4xl">
				<h2 className="text-xl font-semibold mb-4">Project Tracks</h2>
				{projectId && (
					<ViewProjectTracks
						id={projectId}
						selectionMode={"single"}
						onClose={hideCustomModal}
					/>
				)}
			</div>
		</CustomModal>
	)
}

export default ProjectTracksModal
