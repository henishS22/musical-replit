import { useEffect, useState } from "react"

import CustomModal from "@/components/modal/CustomModal"
import { CREATE_MODULE_MODAL, WORK_WITH_AI_MODAL } from "@/constant/modalType"
import {
	handleModalStepBack,
	initializeModalSteps,
	resetModalSteps,
	resetModalStepsTo
} from "@/helpers/modalStepHelpers"

import { AI_DROPDOWN_OPTIONS, getAiDropdownLabel } from "@/config/workWithAi"
import { useDynamicStore, useModalStore } from "@/stores"

import Melodies from "./melodies/Melodies"
import SongsAndLyrics from "./songsAndLyrics"
import Visuals from "./Visuals"

type ContentType = "song" | "melody" | "visual"

const WorkWithAiModal = ({ initialKey }: { initialKey: string }) => {
	const { hideCustomModal, customModalType, showCustomModal } = useModalStore()
	const { addState, modalSteps, removeState } = useDynamicStore()
	const [dropdownValue, setDropdownValue] = useState<string>("")

	// Initialize dropdown value only once when modal opens
	useEffect(() => {
		if (customModalType === WORK_WITH_AI_MODAL && initialKey) {
			setDropdownValue(initialKey)
			initializeModalSteps()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initialKey, customModalType])

	useEffect(() => {
		if (!modalSteps) {
			addState("modalSteps", 0)
		}
	}, [modalSteps, addState])

	const handleDropdownChange = (value: string) => {
		setDropdownValue(value)
		removeState("modalSteps")
		addState("modalSteps", 0)
		initializeModalSteps()
	}

	const handleClose = () => {
		setDropdownValue("")
		resetModalSteps()
		hideCustomModal()
	}

	const handleBack = () => {
		if (modalSteps === 0) {
			showCustomModal({ customModalType: CREATE_MODULE_MODAL })
		} else if (modalSteps === 3 && dropdownValue === "melody") {
			// For melodies, reset history and go to step 1
			resetModalStepsTo(1)
		} else {
			handleModalStepBack()
		}
	}

	const renderContent = () => {
		const contentMap: Record<ContentType, JSX.Element | null> = {
			song: <SongsAndLyrics />,
			melody: <Melodies />,
			visual: <Visuals />
		}
		return (
			contentMap[dropdownValue as ContentType] || <div>Default Content</div>
		)
	}

	return (
		<CustomModal
			key="work-with-ai-modal"
			isBreadcrumb
			onClose={handleClose}
			onBack={handleBack}
			size="5xl"
			modalBodyClass="max-w-[540px]"
			title="Work with AI"
			dropdownConfig={{
				activeLabel: getAiDropdownLabel(dropdownValue),
				value: dropdownValue,
				options: AI_DROPDOWN_OPTIONS,
				onChange: handleDropdownChange
			}}
			showModal={customModalType === WORK_WITH_AI_MODAL}
		>
			{renderContent()}
		</CustomModal>
	)
}

export default WorkWithAiModal
