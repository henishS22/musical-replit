"use client"

import React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

import { fetchApplicationsByProjectId } from "@/app/api/query"
import { PROFILE_IMAGE } from "@/assets"
import { ADD_COLLAB_MODAL, REQUEST_TO_JOIN_MODAL } from "@/constant/modalType"
import { ProjectCollaborator } from "@/types/createProjectTypes"
import { Application } from "@/types/projectDetails"
import { useQuery } from "@tanstack/react-query"

import { useDynamicStore, useModalStore } from "@/stores"

import { RequestToJoin } from "../modal"

function Collaborators({
	name,
	collaborators,
	projectId,
	isOwner,
	permission
}: {
	collaborators: ProjectCollaborator[] | []
	projectId: string
	isOwner: boolean
	permission: string
	name?: string
}) {
	const { showCustomModal } = useModalStore()
	const { removeState, addState } = useDynamicStore()
	const router = useRouter()

	const { data: applications } = useQuery({
		queryKey: ["applications", projectId],
		queryFn: () => fetchApplicationsByProjectId(projectId),
		staleTime: 30000,
		enabled: !!projectId
	})

	return (
		<div className="flex flex-col p-4 w-full rounded-lg border-2 border-solid border-neutral-100">
			<div className="flex flex-col w-full">
				<div className="flex gap-4 items-center w-full font-bold leading-6">
					<div className="self-stretch my-auto text-sm tracking-normal text-zinc-900 cursor-pointer">
						Collaborators
					</div>
					<div className="flex flex-1 shrink gap-3 items-start self-stretch my-auto text-xs tracking-normal text-green-500 basis-0">
						{isOwner && (
							<>
								<div
									className="cursor-pointer hover:text-black hover:underline"
									onClick={() => {
										removeState("selectedUser")
										showCustomModal({
											customModalType: ADD_COLLAB_MODAL,
											tempCustomModalData: {
												selectedProjectId: projectId,
												projectName: name
											}
										})
									}}
								>
									Manage/Invite
								</div>
								<div
									className="cursor-pointer hover:text-black hover:underline"
									onClick={() => {
										addState("CreateOpportunity", {
											currentStep: 0,
											stepsCompleted: [false, false, false, false],
											selectedTracks: [],
											uploadedTrack: null,
											trackId: null,
											selectedProject: { _id: projectId },
											title: "",
											languages: [],
											skills: [],
											styles: [],
											duration: "",
											brief: "",
											track: []
										})
										router.push("/create-opportunity")
									}}
								>
									Post Opportunity
								</div>
							</>
						)}
					</div>
				</div>
				<div className="flex flex-wrap gap-2 items-start mt-3 w-full text-xs font-medium tracking-normal text-gray-500">
					{collaborators.length > 0 ? (
						collaborators.map((collaborator, index) => (
							<div
								key={index}
								className="flex gap-2 items-center cursor-pointer"
								onClick={() => {
									router.push(`/profile/${collaborator.user?._id}`)
								}}
							>
								<Image
									loading="lazy"
									src={collaborator.user?.profile_img || PROFILE_IMAGE}
									className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square rounded-full"
									alt={`${collaborator.user?.name}'s avatar`}
									width={16}
									height={16}
								/>
								<div className="self-stretch my-auto">
									{collaborator.user?.name}
								</div>
							</div>
						))
					) : (
						<div className="gap-4 self-stretch mt-3 w-full text-xs font-medium tracking-normal text-gray-500">
							No Collaborators
						</div>
					)}
				</div>
			</div>
			{permission === "OWNER" && (
				<>
					<div className="mt-4 w-full border border-solid border-neutral-100 min-h-[1px]" />
					<div className="flex flex-col mt-4 w-full">
						<div className="flex gap-10 justify-between items-center w-full font-bold leading-6">
							<div className="self-stretch my-auto text-sm tracking-normal text-zinc-900">
								Request To join
							</div>
							<div className="gap-2 self-stretch px-2 py-1 my-auto text-xs tracking-normal bg-green-100 rounded-lg text-slate-500 ">
								Review Application
							</div>
						</div>
						<div className="flex flex-wrap gap-2 items-start mt-3 w-full text-xs font-medium tracking-normal text-gray-500">
							{applications && applications.length > 0 ? (
								applications.map((application: Application) => (
									<div
										key={application._id}
										className="flex gap-2 items-center cursor-pointer"
										onClick={() => {
											showCustomModal({
												customModalType: REQUEST_TO_JOIN_MODAL,
												tempCustomModalData: application
											})
										}}
									>
										<Image
											loading="lazy"
											src={application.user?.profile_img || PROFILE_IMAGE}
											className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square rounded-full"
											alt={`${application.user?.name}'s avatar`}
											width={16}
											height={16}
										/>
										<div className="self-stretch my-auto">
											{application.user?.name}
										</div>
									</div>
								))
							) : (
								<div className="gap-4 self-stretch mt-3 w-full text-xs font-medium tracking-normal text-gray-500">
									No Application
								</div>
							)}
						</div>
					</div>
				</>
			)}
			<RequestToJoin />
		</div>
	)
}

export default Collaborators
