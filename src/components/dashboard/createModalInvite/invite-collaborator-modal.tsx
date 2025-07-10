"use client"

import { useEffect, useState } from "react"

import CustomModal from "@/components/modal/CustomModal"
import { INVITE_COLLABORATOR_MODAL } from "@/constant/modalType"
import { getDropdownLabel } from "@/helpers"

import { useDynamicStore, useModalStore } from "@/stores"

import { InviteModal } from "./invite-modal"

interface InviteCollaboratorModalProps {
	initialKey?: string
	onBack?: () => void
	onClose?: () => void
}

export function InviteCollaboratorModal({
	initialKey,
	onBack,
	onClose
}: InviteCollaboratorModalProps) {
	const [dropdownValue, setDropdownValue] = useState<string>("email")
	const [navigationState, setNavigationState] = useState<number>(0)
	const { hideCustomModal, customModalType, tempCustomModalData } =
		useModalStore()
	const { addState, updateState, removeState, engageFlow, collabOpp } =
		useDynamicStore()

	const handleClose = () => {
		hideCustomModal()
		removeState("opportunity")
		removeState("opportunityStep")
		tempCustomModalData?.onClose?.()
		onClose?.()
	}

	const handleBack = () => {
		if (navigationState > 0) {
			setNavigationState(navigationState - 1)
		} else {
			tempCustomModalData?.onBack?.()
			onBack?.()
		}
	}

	const renderContent = () => {
		switch (dropdownValue) {
			case "sms":
				return <InviteModal type="sms" />
			case "email":
				return <InviteModal />
			case "opportunity":
				return <InviteModal />
			default:
				return null
		}
	}

	useEffect(() => {
		if (customModalType === INVITE_COLLABORATOR_MODAL) {
			if (dropdownValue === "opportunity") {
				addState("opportunity", true)
			} else {
				updateState("opportunity", false)
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dropdownValue])

	useEffect(() => {
		if (
			customModalType === INVITE_COLLABORATOR_MODAL &&
			(tempCustomModalData?.initialKey || initialKey)
		) {
			if (tempCustomModalData?.initialKey) {
				setDropdownValue(tempCustomModalData?.initialKey)
			} else if (initialKey) {
				setDropdownValue(initialKey)
			}
			setNavigationState(0)
		}
	}, [initialKey, customModalType, tempCustomModalData])

	useEffect(() => {
		if (customModalType !== INVITE_COLLABORATOR_MODAL) {
			setDropdownValue("")
			setNavigationState(0)
		}
	}, [customModalType])

	return (
		<CustomModal
			isBreadcrumb={true}
			onClose={handleClose}
			onBack={handleBack}
			size="xl"
			title={!engageFlow && !collabOpp ? "Invite Collaborator" : "Collaborator"}
			modalBodyClass="max-w-[540px]"
			dropdownConfig={{
				isStatic: engageFlow || collabOpp,
				activeLabel: getDropdownLabel(dropdownValue),
				value: dropdownValue,
				options: !engageFlow
					? [
							{ key: "sms", label: "Invite by SMS" },
							{ key: "email", label: "Invite by Email" },
							{ key: "opportunity", label: "Create Opportunity" }
						]
					: [],
				onChange: setDropdownValue
			}}
			showModal={customModalType === INVITE_COLLABORATOR_MODAL}
		>
			{renderContent()}
		</CustomModal>
	)
}
