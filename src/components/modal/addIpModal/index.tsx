"use client"

import { useEffect, useState } from "react"

import CustomModal from "@/components/modal/CustomModal"
import { REGISTER_IP_MODAL } from "@/constant/modalType"
import { getDropdownLabel } from "@/helpers"

import { useModalStore } from "@/stores"

import AddIpMetadata from "./AddIpMetadata"
import FulfillWeb2 from "./FulfillWeb2"
import PingWeb3Protocol from "./PingWeb3Protocol"

export function AddIpModal({ onBack }: { onBack: () => void }) {
	const [dropdownValue, setDropdownValue] = useState<string>("metadata")
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
			case "metadata":
				return <AddIpMetadata />
			case "web2":
				return <FulfillWeb2 />
			case "web3":
				return <PingWeb3Protocol />
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
			modalBodyClass="max-w-[540px]"
			title="Register IP"
			dropdownConfig={{
				activeLabel: getDropdownLabel(dropdownValue),
				value: dropdownValue,
				options: [
					{ key: "metadata", label: "Add IP Metadata" },
					{ key: "web2", label: "Fulfill Web2 Standards" },
					{ key: "web3", label: "Ping Web3 Protocol" }
				],
				onChange: setDropdownValue
			}}
			showModal={customModalType === REGISTER_IP_MODAL}
		>
			{renderContent()}
		</CustomModal>
	)
}
