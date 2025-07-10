import { useEffect, useState } from "react"

import CustomModal from "@/components/modal/CustomModal"
import { ComingSoon } from "@/components/ui/commingSoon/commingSoon"
import {
	CREATE_MODULE_MODAL,
	GO_VIRAL_MODAL,
	PROMOTE_MODULE_MODAL
} from "@/constant/modalType"
import {
	handleModalStepBack,
	initializeModalSteps,
	resetModalSteps
} from "@/helpers/modalStepHelpers"

import { getGoViralDropdownLabel, GO_VIRAL_OPTIONS } from "@/config/goViral"
import { useDynamicStore, useModalStore } from "@/stores"

type ContentType = "music_influencers"

const GoViralModal = ({
	initialDropdownKey
}: {
	initialDropdownKey: string
}) => {
	const {
		hideCustomModal,
		customModalType,
		showCustomModal,
		tempCustomModalData
	} = useModalStore()
	const { addState, modalSteps, removeState } = useDynamicStore()
	const [dropdownValue, setDropdownValue] = useState<string>("")

	useEffect(() => {
		if (customModalType === GO_VIRAL_MODAL && initialDropdownKey) {
			setDropdownValue(initialDropdownKey)
			initializeModalSteps()
		} else if (customModalType === GO_VIRAL_MODAL && tempCustomModalData) {
			setDropdownValue(tempCustomModalData.initialDropdownKey)
			initializeModalSteps()
		}
	}, [customModalType, initialDropdownKey, tempCustomModalData])

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
		if (customModalType === GO_VIRAL_MODAL) {
			showCustomModal({ customModalType: PROMOTE_MODULE_MODAL })
		} else if (modalSteps === 0) {
			showCustomModal({ customModalType: CREATE_MODULE_MODAL })
		} else {
			handleModalStepBack()
		}
	}

	const renderContent = () => {
		const contentMap: Record<ContentType, JSX.Element> = {
			music_influencers: (
				<div className="p-6">
					<ComingSoon />
				</div>
			)
		}
		return (
			contentMap[dropdownValue as ContentType] || <div>Default Content</div>
		)
	}

	return (
		<CustomModal
			isBreadcrumb={true}
			onClose={handleClose}
			onBack={handleBack}
			size="xl"
			modalBodyClass="max-w-[540px]"
			title="Grow Connections"
			dropdownConfig={{
				activeLabel: getGoViralDropdownLabel(dropdownValue),
				value: dropdownValue,
				options: GO_VIRAL_OPTIONS,
				onChange: handleDropdownChange
			}}
			showModal={customModalType === GO_VIRAL_MODAL}
		>
			{renderContent()}
		</CustomModal>
	)
}

export default GoViralModal
