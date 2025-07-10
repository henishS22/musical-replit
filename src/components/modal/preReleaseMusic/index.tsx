"use client"

import { useEffect, useState } from "react"

import CustomModal from "@/components/modal/CustomModal"
import { PRE_RELEASE_MODAL } from "@/constant/modalType"
import { getDropdownLabel } from "@/helpers"

import { useDynamicStore, useModalStore } from "@/stores"

import { GenerateAccessToken } from "./GenerateAccessToken"

export function PreReleaseMusicModal({ onBack }: { onBack: () => void }) {
	const [dropdownValue, setDropdownValue] = useState<string>("landing")
	const [navigationState, setNavigationState] = useState<number>(0)
	const { hideCustomModal, customModalType, tempCustomModalData } =
		useModalStore()
	const { releaseModalWidth, removeState } = useDynamicStore()
	const handleBack = () => {
		if (navigationState > 0) {
			setNavigationState(navigationState - 1)
		} else {
			onBack()
		}
	}

	const renderContent = () => {
		switch (dropdownValue) {
			case "token":
				return <GenerateAccessToken />
		}
	}

	useEffect(() => {
		if (tempCustomModalData) {
			setDropdownValue(tempCustomModalData.dropdownValue)
			setNavigationState(0)
		}
		removeState("releaseModalWidth")
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [customModalType, tempCustomModalData])

	return (
		<CustomModal
			isBreadcrumb={true}
			onClose={hideCustomModal}
			onBack={handleBack}
			size="5xl"
			title="Pre Release Music"
			dropdownConfig={{
				activeLabel: getDropdownLabel(dropdownValue),
				value: dropdownValue,
				options: [{ key: "token", label: "Generate an Access Token" }],
				onChange: setDropdownValue
			}}
			showModal={customModalType === PRE_RELEASE_MODAL}
			modalBodyClass={releaseModalWidth ? releaseModalWidth : "max-w-[937px]"}
		>
			{renderContent()}
		</CustomModal>
	)
}
