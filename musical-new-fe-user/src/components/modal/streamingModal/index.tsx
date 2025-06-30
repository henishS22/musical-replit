"use client"

import { useEffect, useState } from "react"

import CustomModal from "@/components/modal/CustomModal"
import { STREAMING_MODAL } from "@/constant/modalType"
import { getDropdownLabel } from "@/helpers"

import { useModalStore } from "@/stores"

import AddIpMetadata from "./AddIpMetadata"
import FulfillWeb2 from "./FulfillWeb2"

export function StreamingModal({ onBack }: { onBack: () => void }) {
	const [dropdownValue, setDropdownValue] = useState<string>("releaseAudio")
	const [navigationState, setNavigationState] = useState<number>(0)
	const { hideCustomModal, customModalType, tempCustomModalData } =
		useModalStore()

	const handleBack = () => {
		if (navigationState > 0) {
			setNavigationState(navigationState - 1)
		} else {
			onBack()
		}
	}

	const renderContent = () => {
		switch (dropdownValue) {
			case "releaseAudio":
				return <AddIpMetadata />
			case "releaseVideo":
				return <FulfillWeb2 />
		}
	}

	useEffect(() => {
		if (tempCustomModalData) {
			setDropdownValue(tempCustomModalData.dropdownValue)
			setNavigationState(0)
		}
	}, [customModalType, tempCustomModalData])

	return (
		<CustomModal
			isBreadcrumb={true}
			onClose={hideCustomModal}
			onBack={handleBack}
			size="5xl"
			title="Send to Streaming"
			dropdownConfig={{
				activeLabel: getDropdownLabel(dropdownValue),
				value: dropdownValue,
				options: [
					{ key: "releaseAudio", label: "Release Audio" },
					{ key: "releaseVideo", label: "Release Video" }
				],
				onChange: setDropdownValue
			}}
			showModal={customModalType === STREAMING_MODAL}
		>
			{renderContent()}
		</CustomModal>
	)
}
