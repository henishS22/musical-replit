import { PROMOTE_CREATE_MODAL } from "@/constant/modalType"
import {
	handleModalStepBack,
	resetModalSteps
} from "@/helpers/modalStepHelpers"

import { useDynamicStore, useModalStore } from "@/stores"

import CustomModal from "../CustomModal"
import CreateFlow from "./CreateFlow"

const PromoteCreateModal = () => {
	const { customModalType, hideCustomModal } = useModalStore()
	const {
		promoteFlow,
		removeState,
		modalSteps,
		CreateFlow: createFlowState,
		updateState
	} = useDynamicStore()

	const handleClose = () => {
		hideCustomModal()
		removeState("CreateFlow")
		resetModalSteps()
	}

	const handleBack = () => {
		// If we're at the media type selection (audio/video)
		if (createFlowState?.mediaType && !createFlowState?.creationType) {
			removeState("CreateFlow") // Clear everything to show initial screen
			return
		}

		// If we're at the creation type selection (self/ai)
		if (createFlowState?.creationType && modalSteps === 0) {
			updateState("CreateFlow", {
				mediaType: createFlowState.mediaType,
				creationType: undefined // Keep media type but clear creation type
			})
			return
		}

		// For all other steps, use the modal step navigation
		if (modalSteps > 0) {
			handleModalStepBack()
		}
	}

	const renderContent = () => {
		const contentMap: Record<string, JSX.Element | null> = {
			new_content: <CreateFlow />,
			schedule: null
		}
		return contentMap[promoteFlow] || null
	}

	return (
		<CustomModal
			size="xl"
			modalBodyClass={"max-w-[540px]"}
			isBreadcrumb
			onBack={handleBack}
			dropdownConfig={{
				isStatic: true,
				activeLabel: "Create Something New",
				value: "",
				options: [],
				onChange: () => {}
			}}
			title="Promote"
			showModal={customModalType === PROMOTE_CREATE_MODAL}
			onClose={handleClose}
		>
			{renderContent()}
		</CustomModal>
	)
}

export default PromoteCreateModal
