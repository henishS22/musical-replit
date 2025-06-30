import React, { useState } from "react"
import { toast } from "react-toastify"
import Image from "next/image"
import { useParams } from "next/navigation"

import {
	updateApplicationStatus,
	updateProjectCollaborators
} from "@/app/api/mutation"
import { PROFILE_IMAGE } from "@/assets"
import { INVITE_APPLICANT_MODAL } from "@/constant/modalType"
import { ProjectResponse } from "@/types/dashboarApiTypes"
import { Button } from "@nextui-org/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { useModalStore } from "@/stores"

import CustomModal from "../CustomModal"
import { MessageInput } from "./MessageInput"

export const InviteApplicantModal: React.FC<{
	projectData: ProjectResponse
}> = ({ projectData }) => {
	const { customModalType, hideCustomModal, tempCustomModalData } =
		useModalStore()
	const queryClient = useQueryClient()
	const params = useParams()

	const [message, setMessage] = useState("")

	const { mutate } = useMutation({
		mutationFn: ({
			id,
			payload
		}: {
			id: string
			payload: Record<string, boolean>
		}) => updateApplicationStatus(id, payload),
		onSuccess: (data) => {
			if (data) {
				queryClient.invalidateQueries({ queryKey: ["project", params?.id] })
			}
		}
	})

	const { mutate: updateCollaborators, isPending } = useMutation({
		mutationFn: (data: Record<string, string | number | object>) =>
			updateProjectCollaborators(projectData?._id, data),
		onSuccess: (data) => {
			if (data) {
				mutate({
					id: tempCustomModalData._id,
					payload: {
						isApproved: true
					}
				})
				toast.success("Collaborator added successfully")
				hideCustomModal()
			}
		},
		onError: () => {
			toast.error("Failed to add collaborator")
		}
	})
	const handleSend = () => {
		const formattedCollaborators = projectData?.collaborators.map(
			(collaborator) => ({
				invitedForProject: collaborator.invitedForProject || "false",
				permission: collaborator.permission || "VIEW_ONLY",
				roles: collaborator.roles.map((role) => role._id) || [],
				split: String(collaborator.split) || "0",
				user: collaborator.user?._id,
				users: []
			})
		)
		const payload = {
			user: tempCustomModalData?.userId,
			// email: tempCustomModalData?.email,
			permission: "VIEW_ONLY",
			roles: [],
			split: "0",
			invitedForProject: "false",
			users: []
		}
		const formattedPayload = [...formattedCollaborators, payload]
		updateCollaborators({
			collaborators: formattedPayload
		})
	}
	const handleChange = (value: string) => {
		if (value.length <= 800) {
			setMessage(value)
		}
	}
	return (
		<CustomModal
			onClose={hideCustomModal}
			showModal={customModalType === INVITE_APPLICANT_MODAL}
			size="xl"
		>
			<div className="bg-white max-w-[700px] text-sm text-black tracking-[-0.21px] p-6 rounded-lg">
				<header className="flex w-full items-center gap-2 font-bold justify-center flex-wrap">
					<div className="self-stretch flex-1 shrink basis-[0%] my-auto">
						Invite to Collaborate
					</div>
				</header>
				<main className="w-full mt-4">
					<div className="flex items-center gap-4">
						<Image
							loading="lazy"
							src={tempCustomModalData?.image || PROFILE_IMAGE}
							alt={`${tempCustomModalData?.name}'s profile`}
							className="aspect-[1] object-contain w-11 shrink-0"
							width={44}
							height={44}
						/>
						<span className="font-bold">{tempCustomModalData?.name}</span>
					</div>
					<div className="mt-2">
						<MessageInput value={message} onChange={handleChange} />
					</div>
				</main>

				<div className="flex flex-col items-end w-full text-sm font-bold tracking-normal leading-6 text-black ">
					<Button
						className="gap-2 rounded-lg !max-w-[165px] self-end w-full px-4 py-2 bg-aquamarine text-[13px] font-bold bg-[linear-gradient(175.57deg,#1DB653_3.76%,#0E5828_96.59%)] text-white"
						onPress={handleSend}
						isLoading={isPending}
						isDisabled={isPending || !message}
					>
						Send Message
					</Button>
				</div>
			</div>
		</CustomModal>
	)
}
