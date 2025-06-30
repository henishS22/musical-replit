"use client"

import React, { useEffect, useState } from "react"
import { toast } from "react-toastify"
import Image from "next/image"
import { useParams } from "next/navigation"

import { createChannel, updateProject } from "@/app/api/mutation"
import { fetchChatToken, fetchProject } from "@/app/api/query"
import { ADD, CAMERA_IMAGE, COVER_IMAGE, PROFILE_IMAGE } from "@/assets"
import { InviteApplicantModal } from "@/components/modal"
import { IMAGE_CROP_MODAL } from "@/constant/modalType"
import { ProjectResponse } from "@/types/dashboarApiTypes"
import { Message } from "@/types/projectDetails"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { StreamChat } from "stream-chat"

import { useDynamicStore, useUserStore } from "@/stores"
import { useModalStore } from "@/stores/modal"

import { ImageCropper } from "../dashboard/start-new-project/ImageCropper"
import Collaborators from "./Collaborators"
import Instruments from "./Instruments"
import Lyrics from "./Lyrics"
import ProjectChannel from "./ProjectChannel"
import ProjectFiles from "./ProjectFiles"
import ProjectHeader from "./ProjectHeader"
import ProjectTabs from "./ProjectTabs"
import CreateTab from "./ProjectTabs/CreateTab"
import EngageTab from "./ProjectTabs/EngageTab"
import PromoteTab from "./ProjectTabs/PromoteTab"
import ReleaseTab from "./ProjectTabs/ReleaseTab"

function Studio() {
	const [activeTab, setActiveTab] = useState("Studio")
	const params = useParams()
	const queryClient = useQueryClient()
	const { showCustomModal } = useModalStore()
	const { user } = useUserStore()
	const { addState } = useDynamicStore()

	const [artwork, setArtwork] = useState<string | null>(null)
	const [coverImage, setCoverImage] = useState<string | null>(null)
	const [isArtworkUpdated, setIsArtworkUpdated] = useState(false)
	const [rawImage, setRawImage] = useState<File | null>(null)

	const fileInputRef = React.useRef<HTMLInputElement | null>(null)

	const [client, setClient] = useState<StreamChat | null>(null)
	const [messages, setMessages] = useState<Message[]>([])
	const renderTabContent = () => {
		switch (activeTab) {
			case "Studio":
				return <ProjectFiles permission={projectData?.permission as string} />
			case "Create":
				return <CreateTab />
			case "Release":
				return <ReleaseTab tokenProject={projectData as ProjectResponse} />
			case "Promote":
				return <PromoteTab />
			case "Engage":
				return <EngageTab />
			default:
				return null
		}
	}

	const projectId = params.id
	const { data: projectData } = useQuery({
		queryKey: ["project", projectId],
		queryFn: () => fetchProject(projectId as string),
		enabled: !!projectId,
		staleTime: 300000
	})

	const { mutate } = useMutation({
		mutationFn: (payload: FormData) =>
			updateProject(projectId as string, payload),
		onSuccess: (data) => {
			if (data) {
				toast.success("Project updated successfully")
				queryClient.invalidateQueries({ queryKey: ["project", projectId] })
			}
		},
		onError: (error: Error) => {
			toast.error(error.message)
		}
	})

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (file) {
			setRawImage(file)
			showCustomModal({ customModalType: IMAGE_CROP_MODAL })
		}
	}

	const handleCropSave = (croppedImage: File) => {
		const formData = new FormData()
		if (isArtworkUpdated) {
			formData.append("artwork", croppedImage)
			setArtwork(URL.createObjectURL(croppedImage))
		} else {
			formData.append("coverImage", croppedImage)
			setCoverImage(URL.createObjectURL(croppedImage))
		}
		mutate(formData)
	}

	const { mutate: createChannelMutation } = useMutation({
		mutationFn: createChannel,
		onError: () => {
			toast.error("Failed to create channel")
		}
	})

	const { data: chatToken } = useQuery({
		queryKey: ["chatToken"],
		queryFn: fetchChatToken
	})

	const fetchChannel = async () => {
		if (!client || !projectData) return
		try {
			const channels = await client.queryChannels({ id: projectId as string })
			if (channels.length > 0) {
				const channel = channels[0]

				// 1. Update channel name if changed
				if (channel.data?.name !== projectData.name) {
					await channel.updatePartial({
						set: { name: projectData.name }
					})
				}

				// 2. Add missing collaborators as members
				const currentMembers = await channel.queryMembers({})
				const currentMemberIds = currentMembers.members.map((m) => m.user_id)

				const collaboratorIds = projectData?.collaborators
					?.map((collab) => collab?.user?._id)
					.filter((id): id is string => !!id)

				const missingMembers = collaboratorIds.filter(
					(id) => !currentMemberIds.includes(id)
				)

				if (missingMembers.length > 0) {
					await channel.addMembers(missingMembers)
				}

				const result = await channel.query({
					messages: { limit: 2 }
				})
				const messages = result?.messages.map((message) => ({
					id: message.id,
					text: message.text as string,
					user: {
						id: message.user?.id as string,
						name: message.user?.name as string,
						image: message.user?.image as string
					},
					cid: message.cid as string,
					created_at: message.created_at as string,
					updated_at: message.updated_at as string
				}))
				setMessages(messages)
			} else {
				const payload = {
					team: projectData?.collaborators
						?.map((collaborator) => collaborator?.user?._id)
						.filter((x) => x != null),
					channelId: projectId as string,
					type: "projects",
					image: projectData?.artworkUrl,
					channelName: projectData?.name
				}

				createChannelMutation(payload as Record<string, string | string[]>)
			}
		} catch (error) {
			console.error("error", error)
		}
	}

	const subscribeChat = async () => {
		if (!client || !chatToken) return
		await client.connectUser(
			{
				id: user?.id as string
			},
			chatToken
		)
	}

	useEffect(() => {
		subscribeChat()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [client, user, chatToken])

	useEffect(() => {
		fetchChannel()
		if (projectData) addState("projectData", projectData)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectData])

	useEffect(() => {
		const chatClient = StreamChat.getInstance(
			process.env.NEXT_PUBLIC_KEY_GETSTREAM || ""
		)
		setClient(chatClient)
	}, [])

	return (
		<div>
			<div className="relative">
				<Image
					src={coverImage || projectData?.coverImageUrl || COVER_IMAGE}
					alt="cover"
					className="w-full h-[218px] rounded-lg"
					width={1000}
					height={218}
				/>
				{projectData?.user?._id === user?.id && (
					<Image
						src={CAMERA_IMAGE}
						alt="cover"
						className="w-[48px] h-[48px] rounded-lg absolute bottom-[70px] right-[20px] cursor-pointer"
						width={48}
						height={48}
						onClick={() => {
							setIsArtworkUpdated(false)
							fileInputRef.current?.click()
						}}
					/>
				)}
			</div>

			<div className="flex flex-col bg-white rounded-xl max-md:px-5 w-[calc(100%-40px)] relative mx-auto mt-[-60px] p-6">
				<div className="flex justify-between items-center min-h-[74px]">
					<div className="absolute top-[-96px] left-[23px]">
						<div className=" w-[198px] h-[198px] relative">
							<Image
								src={artwork || projectData?.artworkUrl || PROFILE_IMAGE}
								className="object-cover my-auto w-[198px] h-[198px]"
								alt="profile"
								width={198}
								height={198}
							/>
							{projectData?.user?._id === user?.id && (
								<Image
									src={ADD}
									alt="add"
									width={48}
									height={48}
									className="absolute bottom-[-10px] right-[-18px] cursor-pointer"
									onClick={() => {
										setIsArtworkUpdated(true)
										fileInputRef.current?.click()
									}}
								/>
							)}
						</div>
					</div>
					<ProjectHeader
						isPublic={projectData?.isPublic || false}
						name={projectData?.name || ""}
						isOwner={projectData?.user?._id === user?.id}
					/>
				</div>

				<div className="flex flex-wrap gap-6 items-start mt-7 w-full min-h-[calc(100vh-505px)]">
					<div
						className={`flex flex-col min-w-[240px]  ${activeTab === "Studio" ? "w-[678px] " : "w-full"}`}
					>
						<ProjectTabs
							activeTab={activeTab}
							setActiveTab={setActiveTab}
							isOwner={projectData?.user?._id === user?.id}
						/>
						{renderTabContent()}
					</div>
					{activeTab === "Studio" && (
						<div className="flex flex-col flex-1 shrink basis-0 min-w-[356px]">
							<Collaborators
								name={projectData?.name}
								collaborators={projectData?.collaborators || []}
								projectId={projectId as string}
								isOwner={projectData?.user?._id === user?.id}
								permission={projectData?.permission as string}
							/>
							{projectData?.user?._id === user?.id && <Lyrics />}
							<ProjectChannel
								messages={messages}
								projectName={projectData?.name || ""}
							/>
							<Instruments />
						</div>
					)}
				</div>
			</div>
			<InviteApplicantModal projectData={projectData as ProjectResponse} />
			<input
				type="file"
				ref={fileInputRef}
				className="hidden"
				onChange={handleFileChange}
			/>
			{rawImage && (
				<ImageCropper
					imageFile={rawImage}
					onSave={handleCropSave}
					aspectRatio={isArtworkUpdated ? 1 : 2}
				/>
			)}
		</div>
	)
}

export default Studio
