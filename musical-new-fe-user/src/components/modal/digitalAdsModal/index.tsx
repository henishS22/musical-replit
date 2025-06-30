import { useEffect, useState } from "react"

import { DIGITAL_ADS_MODAL, PROMOTE_MODULE_MODAL } from "@/constant/modalType"
import { getDropdownLabel } from "@/helpers/inviteCollaboratorHelpers"
import {
	handleModalStepBack,
	initializeModalSteps,
	resetModalSteps
} from "@/helpers/modalStepHelpers"
import { DropdownConfig } from "@/types/breadcrumbTypes"

import { useDynamicStore, useModalStore } from "@/stores"

import CustomModal from "../CustomModal"
import { GenerateAccessToken } from "../preReleaseMusic/GenerateAccessToken"

const DigitalAdsModal = ({
	initialDropdownKey
}: {
	initialDropdownKey: string
}) => {
	const {
		customModalType,
		hideCustomModal,
		showCustomModal,
		tempCustomModalData
	} = useModalStore()
	const { modalSteps } = useDynamicStore()
	const [dropdownKey, setDropdownKey] = useState(initialDropdownKey)

	useEffect(() => {
		// Initialize modal steps when the modal opens
		if (customModalType === DIGITAL_ADS_MODAL) {
			if (initialDropdownKey) {
				setDropdownKey(initialDropdownKey)
			} else if (tempCustomModalData) {
				setDropdownKey(tempCustomModalData.initialDropdownKey)
			}
			initializeModalSteps()
		}
	}, [customModalType, initialDropdownKey, tempCustomModalData])

	const handleClose = () => {
		hideCustomModal()
		resetModalSteps()
	}

	const handleBack = () => {
		if (modalSteps > 0) {
			handleModalStepBack()
		} else {
			showCustomModal({
				customModalType: PROMOTE_MODULE_MODAL
			})
		}
	}

	const dropdownConfig: DropdownConfig = {
		activeLabel: getDropdownLabel(dropdownKey),
		value: dropdownKey,
		options: [{ key: "crowdfund", label: "Crowdfund a Campaign" }],
		onChange: (key: string) => setDropdownKey(key)
	}

	const renderContent = () => {
		const contentMap: Record<string, JSX.Element> = {
			crowdfund: <GenerateAccessToken />
		}
		return contentMap[dropdownKey]
	}

	return (
		<CustomModal
			size={dropdownKey === "crowdfund" ? "5xl" : "xl"}
			isBreadcrumb
			modalBodyClass={
				dropdownKey === "crowdfund" ? "max-w-[937px]" : "max-w-[540px]"
			}
			onBack={handleBack}
			dropdownConfig={dropdownConfig}
			title="Run Digital Ads"
			showModal={customModalType === DIGITAL_ADS_MODAL}
			onClose={handleClose}
		>
			{renderContent()}
		</CustomModal>
	)
}

export default DigitalAdsModal
