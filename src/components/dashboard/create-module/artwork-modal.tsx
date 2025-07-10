"use client"

// import { useState } from "react"
import { useRef } from "react"
import { toast } from "react-toastify"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"

import { addTracksToProject } from "@/app/api/mutation"
import { ADD_COLLAB_MODAL, EXISTINGPRO_MODAL } from "@/constant/modalType"
import { TRACK_ADDED_TO_PROJECT_SUCCESSFULLY } from "@/constant/toastMessages"
import { ArtworkModalProps } from "@/types/artworkModalType"
import { Button } from "@nextui-org/react"
import { useMutation } from "@tanstack/react-query"

import { useDynamicStore, useModalStore } from "@/stores"

import InviteEmailBody from "../createModalInvite/inviteEmailBody"

export function ArtworkModal({
	modalSteps,
	secondaryButton = false,
	title = "Manage Your Recording",
	description = "Add this recording to an existing project or use it to start a new one.",
	artworkUrl,
	existingProject = {
		text: "Add to an existing project"
	},
	newProject = {
		text: "Start a new project"
	},
	share = false,
	padding = "p-4",
	media = true,
	setNext,
	icon,
	headClasses,
	form = false,
	type,
	shareButton = {
		text: "Post to Social"
	},
	onFileSelect
}: ArtworkModalProps): JSX.Element {
	const router = useRouter()
	const { trackId, removeState, ProjectStartSolo, ProjectInviteCollaborator } =
		useDynamicStore()
	const { id } = useParams()
	const { showCustomModal, hideCustomModal } = useModalStore()
	const fileInputRef = useRef<HTMLInputElement>(null)

	const { mutate: addTracksToProjectMutation, isPending } = useMutation({
		mutationFn: (payload: { projectId: string; trackIds: string[] }) =>
			addTracksToProject(payload),
		onSuccess: (data) => {
			if (data) {
				toast.success(TRACK_ADDED_TO_PROJECT_SUCCESSFULLY)
				hideCustomModal()
				removeState("trackId")
			}
		}
	})

	const hideModal = () => {
		hideCustomModal()
		removeState("collabData")
		router.push("/create-project")
	}

	return (
		<div className="w-full max-w-[500px] mx-auto bg-white p-0 rounded-xl">
			{/* File Input */}
			{onFileSelect && (
				<input
					type="file"
					ref={fileInputRef}
					className="hidden"
					multiple
					accept="audio/*"
					onChange={(e) => {
						const files = e.target.files
						if (files && files.length > 0) {
							onFileSelect(files)
						}
					}}
				/>
			)}
			<div className={`bg-[#FCFCFC] rounded-xl ${padding}`}>
				{icon && (
					<div className="flex justify-center mb-[47px]">
						<div
							className={`w-16 h-16 rounded-full ${icon.bgColor} flex items-center justify-center`}
						>
							<Image src={icon.src} alt={icon.alt} width={32} height={32} />
						</div>
					</div>
				)}
				<div className="flex flex-col items-center text-center mb-[47px]">
					<h3
						className={
							!headClasses
								? `text-textGray text-[15px] font-[500] mb-1 leading-[24px] tracking-[-0.01em]`
								: headClasses?.title + " mb-1"
						}
					>
						{title}
					</h3>
					<p
						className={`${!headClasses ? `text-textGray text-[15px] font-[500] leading-[24px] tracking-[-0.01em]` : headClasses?.description ? headClasses?.description : headClasses?.title}`}
					>
						{description}
					</p>
				</div>

				{media && (
					<div
						className={`rounded-xl overflow-hidden ${trackId.mediaType !== "video" && !artworkUrl ? "" : "mb-[47px]"}`}
					>
						{trackId?.mediaType === "video" ? (
							<video
								src={trackId?.file}
								controls
								autoPlay
								className="w-full h-[281px] object-cover rounded-xl"
							/>
						) : (
							artworkUrl && (
								<Image
									src={artworkUrl || ""}
									alt="AI Generated Artwork"
									width={468}
									height={200}
									className="w-full h-[200px] object-cover rounded-xl"
								/>
							)
						)}
					</div>
				)}
				{!id || !ProjectStartSolo ? (
					!form ? (
						// if the modal is on projectDetails page show two buttons
						!id ? (
							<div className="flex gap-[20px] justify-center">
								<Button
									className={`bg-btnColor text-white px-4 py-2 rounded-lg text-[13px] hover:bg-btnColorHover`}
									onPress={() => {
										if (existingProject.onClick) {
											existingProject.onClick()
										} else {
											showCustomModal({
												customModalType: EXISTINGPRO_MODAL,
												tempCustomModalData: {
													startSolo: true
												}
											})
										}
									}}
								>
									{existingProject?.text}
								</Button>

								{!secondaryButton && (
									<Button
										className={`font-bold rounded-md px-4 py-2 text-sm shadow transition-colors bg-videoBtnGreen text-[#0D5326]`}
										isLoading={newProject?.isLoading}
										onPress={() => {
											if (newProject.onClick) {
												newProject.onClick()
											} else {
												hideModal()
											}
										}}
									>
										{newProject?.text}
									</Button>
								)}
							</div>
						) : // if the modal is on fisrt step two show two buttons
						modalSteps !== 0 ? (
							<div className="flex justify-center">
								<Button
									className="bg-btnColor text-white px-4 py-2 rounded-lg text-[13px] w-full max-w-[352px] hover:bg-btnColorHover"
									isLoading={isPending}
									onPress={() => {
										addTracksToProjectMutation({
											projectId: id as string,
											trackIds: [trackId?.id as string]
										})
									}}
								>
									Save
								</Button>
							</div>
						) : (
							<div className="flex gap-[20px] justify-center">
								<Button
									className={`bg-btnColor text-white px-4 py-2 rounded-lg text-[13px] hover:bg-btnColorHover`}
									onPress={() => {
										if (existingProject.onClick) {
											existingProject.onClick()
										} else {
											showCustomModal({
												customModalType: EXISTINGPRO_MODAL,
												tempCustomModalData: {
													startSolo: true
												}
											})
										}
									}}
								>
									{existingProject?.text}
								</Button>

								{!secondaryButton && (
									<Button
										className={`font-bold rounded-md px-4 py-2 text-sm shadow transition-colors bg-videoBtnGreen text-[#0D5326]`}
										onPress={() => {
											if (newProject.onClick) {
												newProject.onClick()
											} else {
												hideModal()
											}
										}}
									>
										{newProject?.text}
									</Button>
								)}
							</div>
						)
					) : (
						setNext && <InviteEmailBody setNext={setNext} type={type} />
					)
				) : (
					<div className="flex justify-center">
						<Button
							className="bg-btnColor text-white px-4 py-2 rounded-lg text-[13px] w-full max-w-[352px] hover:bg-btnColorHover"
							isLoading={isPending}
							onPress={() => {
								if (ProjectInviteCollaborator) {
									showCustomModal({
										customModalType: ADD_COLLAB_MODAL,
										tempCustomModalData: {
											selectedProjectId: id as string
										}
									})
								} else {
									addTracksToProjectMutation({
										projectId: id as string,
										trackIds: [trackId?.id as string]
									})
								}
							}}
						>
							Save
						</Button>
					</div>
				)}

				{/* Share Your Creation Button */}
				{share && (
					<div className="flex justify-center">
						<Button
							className="w-full max-w-[352px] mt-4 border border-[#DDF5E5] bg-transparent text-[#0D5326] font-bold rounded-md py-3 text-sm hover:bg-[#F4F4F4] transition-colors"
							onPress={() => {
								if (onFileSelect) {
									fileInputRef.current?.click()
								} else if (shareButton?.onClick) {
									shareButton.onClick()
								} else {
									hideCustomModal()
									removeState("chips")
									router.push("/post-audio-or-video")
								}
							}}
						>
							{shareButton?.text}
						</Button>
					</div>
				)}
			</div>
		</div>
	)
}
