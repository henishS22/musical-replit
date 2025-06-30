"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { EMAIL_ICON, SMS_ICON } from "@/assets"
import { EXISTINGPRO_MODAL } from "@/constant/modalType"

import { useDynamicStore } from "@/stores"
import { useModalStore } from "@/stores/modal"

import { ArtworkModal } from "../create-module/artwork-modal"
import { OpportunityFlow } from "./opportunityFlow"

export function InviteModal({ type = "email" }: { type?: string }) {
	const [next, setNext] = useState(false)
	const { showCustomModal, hideCustomModal } = useModalStore()
	const { removeState, opportunity } = useDynamicStore()
	const router = useRouter()

	return (
		<>
			<div className="w-full bg-[#FCFCFC] p-6 rounded-xl">
				{!next ? (
					opportunity ? (
						<OpportunityFlow />
					) : (
						<ArtworkModal
							type={type}
							padding="p-0"
							headClasses={{
								title: "text-[#0A1629] text-[16px] font-semibold"
							}}
							title={type === "email" ? "Invite by Email:" : "Invite by SMS:"}
							description={
								type === "email"
									? "Invite/Add Collaborators for your project."
									: "Text your partners details on the collab"
							}
							icon={{
								src: type === "email" ? EMAIL_ICON : SMS_ICON,
								alt: "Message Icon",
								bgColor: "bg-[#B9E9CA]"
							}}
							media={false}
							setNext={(state: boolean) => setNext(state)}
							form
						/>
					)
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
									removeState("trackId")
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
								router.push("/create-project")
							}
						}}
						share={false}
						padding="py-[82px] px-[29px]"
						media={false}
						// secondaryButton
					/>
				)}
			</div>
		</>
	)
}
