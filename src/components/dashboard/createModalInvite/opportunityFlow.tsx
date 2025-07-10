"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { EXISTINGPRO_MODAL } from "@/constant/modalType"

import { useDynamicStore } from "@/stores"
import { useModalStore } from "@/stores/modal"

import { ArtworkModal } from "../create-module/artwork-modal"

export function OpportunityFlow() {
	const router = useRouter()
	const { showCustomModal, hideCustomModal } = useModalStore()
	const { removeState, addState, opportunity, opportunityStep, engageFlow } =
		useDynamicStore()

	useEffect(() => {
		if (!opportunityStep && !engageFlow) {
			addState("opportunityStep", 0)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const goToProjectSelection = () => {
		addState("opportunityStep", 1)
	}

	if (!opportunity) return null

	return opportunityStep === 0 ? (
		<ArtworkModal
			title="Who do you want to collaborate with?"
			description="Choose whether you want to create an opportunity with your Fans or a Guild Artist."
			existingProject={{
				text: "Work With Guild Artist",
				onClick: () => {
					goToProjectSelection()
				}
			}}
			newProject={{
				text: "Work With Fans",
				onClick: () => {
					addState("engageFlow", true)
					goToProjectSelection()
				}
			}}
			share={false}
			padding="py-[82px] px-[29px]"
			media={false}
		/>
	) : (
		<ArtworkModal
			title="Select a Project:"
			description="Choose an existing project to collaborate on or start a new one!"
			existingProject={{
				text: "Collaborate on Existing",
				onClick: () => {
					if (!opportunity) {
						showCustomModal({ customModalType: EXISTINGPRO_MODAL })
					} else {
						removeState("CreateOpportunity")
						removeState("opportunityStep")
						removeState("opportunity")
						removeState("trackId")
						removeState("collabOpp")
						hideCustomModal()
						router.push("/create-opportunity")
					}
				}
			}}
			newProject={{
				text: "Start a new project",
				onClick: () => {
					hideCustomModal()
					removeState("trackId")
					removeState("collabData")
					removeState("opportunityStep")
					removeState("collabOpp")
					router.push("/create-project")
				}
			}}
			share={false}
			padding="py-[82px] px-[29px]"
			media={false}
			// secondaryButton
		/>
	)
}
