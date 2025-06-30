"use client"

import * as React from "react"
import { FormProvider, useForm } from "react-hook-form"
import { toast } from "react-toastify"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"

import { createProject, updateProject } from "@/app/api/mutation"
import { fetchProject, fetchTrackDetails, fetchUserData } from "@/app/api/query"
import {
	MEDIA_PREVIEW,
	MEMBER,
	MUSIC,
	PROFILE_IMAGE,
	VINYL_RECORD
} from "@/assets"
import CollaboratorSection from "@/components/createProject/collaborator/CollaboratorSection"
import FileDisplay from "@/components/createProject/FileDisplay"
import ImageUpload from "@/components/createProject/ImageUpload"
import PreviewCard from "@/components/createProject/PreviewCard"
import { CustomInput, TitleBadgeCard } from "@/components/ui"
import CustomToggle from "@/components/ui/customToggle"
import {
	AUDIO_VIDEO_MODAL,
	INVITE_COLLABORATOR_MODAL
} from "@/constant/modalType"
import {
	PROJECT_CREATED_SUCCESSFULLY,
	SOMETHING_WENT_WRONG
} from "@/constant/toastMessages"
import { convertUrlToBlob, generateWaveformImage } from "@/helpers"
import { formatCollaborators } from "@/helpers/collaboratorHelpers"
import { ProjectCollaborator } from "@/types"
import {
	ProjectFormData,
	projectSchema
} from "@/validationSchema/CreateProjectSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@nextui-org/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { useDynamicStore, useModalStore, useUserStore } from "@/stores"
import { TrackFile } from "@/stores/dynamicStates"
import { useFormNavigationAlert } from "@/hooks/useFormNavigationAlert"

// import { useShowFilesStore } from "@/stores/showFileStore"

export default function CreateProject() {
	const {
		trackId,
		addState,
		updateState,
		opportunity,
		removeState,
		isReleaseTrack
	} = useDynamicStore()
	const { user, userData } = useUserStore()
	const router = useRouter()
	const params = useParams()

	const methods = useForm<ProjectFormData>({
		resolver: zodResolver(projectSchema),
		defaultValues: {
			productTitle: "",
			projectType: "single",
			collaborators: []
		}
	})

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		reset,
		resetField,
		formState: { errors, isDirty }
	} = methods

	useFormNavigationAlert({ formState: { isDirty } })

	const projectType = watch("projectType")
	const artwork = watch("artwork")
	const productTitle = watch("productTitle")
	const { showCustomModal } = useModalStore()

	const [imageSmall, setImageSmall] = React.useState<{
		dataUrl: string
		blob: Blob
	} | null>(null)

	const artworkRef = React.useRef<HTMLDivElement>(null)

	const projectId = params.id

	const isUpdateProject = projectId ? true : false

	const queryClient = useQueryClient()

	const { data: projectData, isPending: isProjectLoading } = useQuery({
		queryKey: ["project", projectId],
		queryFn: () => fetchProject(projectId as string),
		enabled: !!projectId,
		staleTime: 300000
	})

	const projectMutationFn = async (val: FormData) => {
		if (isUpdateProject) {
			return updateProject(projectId as string, val)
		} else return createProject(val)
	}

	const { mutate, isPending } = useMutation({
		mutationFn: (val: FormData) => projectMutationFn(val),
		onSuccess: (data) => {
			updateState("formNavigation", { isDirty: false })
			if (data) {
				toast.success(PROJECT_CREATED_SUCCESSFULLY)
				reset()
				if (opportunity) {
					removeState("opportunity")
					addState("CreateOpportunity", {
						currentStep: 0,
						stepsCompleted: [false, false, false, false],
						selectedTracks: [],
						uploadedTrack: null,
						trackId: null,
						selectedProject: { _id: data?.data?._id },
						title: "",
						languages: [],
						skills: [],
						styles: [],
						duration: "",
						brief: "",
						track: []
					})
					router.push(`/create-opportunity`)
				} else if (isUpdateProject) {
					queryClient.invalidateQueries({ queryKey: ["projectList"] })
					router.push(`/project/${data?.data?._id}`)
				} else if (isReleaseTrack) {
					removeState("isReleaseTrack")
					router.push(`/create-track`)
				} else {
					router.push(`/project/${data?.data?._id}`)
				}
			}
		},
		onError: (error: unknown) => {
			if (error instanceof Error) {
				toast.error("Error: " + error.message)
			} else {
				toast.error(SOMETHING_WENT_WRONG)
			}
		}
	})

	const { data } = useQuery({
		queryKey: ["userData"],
		queryFn: () => {
			if (user?.id) {
				return fetchUserData(user.id)
			}
		},
		staleTime: 20000,
		enabled: !!user?.id
	})

	const { data: trackDetails } = useQuery({
		queryKey: ["trackDetails", trackId?.id],
		queryFn: () => fetchTrackDetails(trackId?.id as string),
		enabled: !!trackId?.id
	})

	const handleGenerateImages = async () => {
		try {
			const response = await fetch(trackId.file)
			if (!response.ok) {
				throw new Error(`Failed to fetch audio file: ${response.statusText}`)
			}

			const audioBlob = await response.blob()
			const audioUrl = URL.createObjectURL(audioBlob)
			// Generate small waveform image
			const smallImage = await generateWaveformImage({
				audioUrl,
				resolution: 512 // Small resolution
			})

			setImageSmall({ dataUrl: smallImage.dataUrl, blob: smallImage.blob }) // Store both
		} catch (error) {
			toast.error("Error generating waveform images: " + error)
		}
	}

	const onSubmit = (data: ProjectFormData) => {
		// Create a FormData object
		const formData = new FormData()
		formData.append("name", data.productTitle)

		formData.append("artwork", data.artwork)

		formData.append("splitModel", "CUSTOMIZED")

		if (data.collaborators[0]?.split) {
			formData.append("split", data.collaborators[0].split.toString())
		}

		formData.append("type", data.projectType.toUpperCase())

		if (trackId) {
			formData.append("trackId", trackId.id)
		}

		data.collaborators[0].roles.forEach((role, index) => {
			if (role) formData.append(`ownerRoles[${index}]`, role)
		})

		if (data.collaborators.length > 1) {
			data.collaborators
				.slice(1, data.collaborators.length)
				.forEach((collaborator, index) => {
					// formData.append(`collaborators[${index}][invitedForProject]`, "false")
					// Handle invited vs existing users
					if (collaborator.invitedForProject) {
						if (collaborator.email) {
							formData.append(
								`collaborators[${index}][email]`,
								collaborator.email
							)
						}
						formData.append(
							`collaborators[${index}][invitedForProject]`,
							collaborator.invitedForProject.toString()
						)
					} else {
						if (collaborator.userId) {
							formData.append(
								`collaborators[${index}][user]`,
								collaborator.userId
							)
						}
					}
					formData.append(
						`collaborators[${index}][split]`,
						collaborator.split.toString()
					)
					formData.append(
						`collaborators[${index}][permission]`,
						collaborator.permission.replace(" ", "_").toUpperCase()
					)
					collaborator.roles.forEach((role, idxRole) => {
						formData.append(`collaborators[${index}][roles][${idxRole}]`, role)
					})
				})
		}

		mutate(formData)
	}

	const showPreviewModal = () => {
		showCustomModal({ customModalType: AUDIO_VIDEO_MODAL })
	}

	const PreviewComponent = () => {
		return (
			<div
				className="flex gap-2.5 items-start self-stretch w-10 cursor-pointer"
				onClick={showPreviewModal}
			>
				<Image
					loading="lazy"
					src={MEDIA_PREVIEW}
					alt="Preview controls"
					width={24}
					height={24}
					className="object-contain"
				/>
			</div>
		)
	}

	React.useEffect(() => {
		addState("userDetails", { ...data })
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data])

	React.useEffect(() => {
		if (trackDetails) {
			updateState("trackId", {
				file: trackDetails?.url
			})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [trackDetails])

	React.useEffect(() => {
		if (trackId) {
			setValue("recordedFile", trackId?.file)
			handleGenerateImages()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [trackId])

	React.useEffect(() => {
		if (projectData) {
			setValue("productTitle", projectData?.name)
			setValue(
				"projectType",
				projectData?.type === "SINGLE" ? "single" : "album"
			)
			convertUrlToBlob(projectData?.artworkUrl as string).then(
				(blob: Blob | null) => {
					if (blob) {
						setValue(
							"artwork",
							new File([blob], "artwork.png", { type: "image/png" })
						)
					}
				}
			)
			if (!isProjectLoading && projectData) {
				//setCollaborators project already have
				const formattedCollaborators = formatCollaborators(
					projectData?.collaborators as ProjectCollaborator[]
				)

				//set the ownerCollaborator
				const ownerCollaborator = {
					name: data?.name || "Unknown User",
					userId: data?._id,
					image: data?.profile_img || MEMBER,
					permission: "Owner",
					split: projectData?.split,
					roles: projectData?.ownerRoles?.map((role) => role?._id) || []
				}

				//setUpdated collaborators
				const updatedCollaborators = formattedCollaborators
					? [ownerCollaborator, ...formattedCollaborators]
					: [ownerCollaborator]

				addState("collabData", {
					formattedCollaborators: updatedCollaborators,
					isProjectLoading: false
				})
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectData])

	React.useEffect(() => {
		if (errors.artwork && artworkRef.current) {
			artworkRef.current.scrollIntoView({
				behavior: "smooth",
				block: "center"
			})
		}
	}, [errors.artwork])

	React.useEffect(() => {
		addState("productTitle", productTitle)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [productTitle])

	return (
		<FormProvider {...methods}>
			<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
				<h1 className="text-4xl font-semibold tracking-tighter leading-tight text-zinc-800">
					{isUpdateProject ? "Edit Project" : "New Project"}
				</h1>
				<div className="flex flex-wrap gap-2 items-start mt-6 w-full max-md:max-w-full">
					<div className="flex flex-col flex-1 shrink basis-12 min-w-[240px] max-md:max-w-full">
						<TitleBadgeCard
							markColor="#8A8A8A"
							title="Name"
							titleClassName="!mb-0"
						>
							<div className="flex flex-col mt-8 w-full max-md:max-w-full">
								<CustomInput
									{...register("productTitle")}
									label="Product title"
									type="text"
									id="productTitle"
									showTooltip
									tooltipText="Maximum 100 characters. No HTML or emoji allowed"
									errorMessage={errors.productTitle?.message || ""}
									isInvalid={!!errors.productTitle}
								/>
							</div>
						</TitleBadgeCard>
						{trackId && (
							<TitleBadgeCard
								markColor="#8A8A8A"
								title="Recorded File"
								titleClassName="!mb-0"
							>
								<FileDisplay
									label={trackId?.mediaType === "audio" ? "Music" : "Video"}
									fileName={trackId?.fileName}
									duration={(trackId as TrackFile)?.duration || 0}
									iconSrc={MUSIC}
									error={errors.recordedFile?.message}
									smallWaveformImage={imageSmall?.dataUrl}
								/>
							</TitleBadgeCard>
						)}

						<TitleBadgeCard
							markColor="#8A8A8A"
							title="Artwork"
							titleClassName="!mb-0"
						>
							<div className="flex flex-col mt-8 w-full" ref={artworkRef}>
								<ImageUpload
									onImageUpload={(file) => {
										setValue("artwork", file)
									}}
									onRemove={() => {
										resetField("artwork")
									}}
									error={errors.artwork?.message}
									// disabled={isUpdateProject}
									artworkUrl={(projectData?.artworkUrl as string) || ""}
									rawArtworkUrl={artwork as File}
								/>
							</div>
						</TitleBadgeCard>

						<TitleBadgeCard
							markColor="#8A8A8A"
							title="Type"
							titleClassName="!mb-0"
						>
							<div className="flex flex-col mt-8 w-full max-md:max-w-full">
								<div className="flex flex-col w-full max-md:max-w-full">
									<CustomToggle
										label="Single"
										isActive={projectType === "single"}
										onClick={() => {
											setValue("projectType", "single")
										}}
									/>
									<div className="flex mt-4 w-full rounded-sm bg-zinc-100 min-h-[1px]" />
									<div className="mt-4">
										<CustomToggle
											label="Album"
											isActive={projectType === "album"}
											onClick={() => {
												setValue("projectType", "album")
											}}
										/>
									</div>
									{errors.projectType && (
										<span className="text-red-500 text-sm mt-2">
											{errors.projectType.message}
										</span>
									)}
								</div>
							</div>
						</TitleBadgeCard>

						<CollaboratorSection setValue={setValue} />
						{errors.collaborators && Array.isArray(errors.collaborators) && (
							<div className="text-red-500 text-sm mt-2">
								{(() => {
									const uniqueErrors = new Set<string>()
									errors.collaborators.forEach((error) => {
										if (error?.roles?.message)
											uniqueErrors.add(error.roles.message)
										if (error?.split?.message)
											uniqueErrors.add(error.split.message)
									})
									return Array.from(uniqueErrors).map((message, index) => (
										<p key={index}>- {message}</p>
									))
								})()}
							</div>
						)}
					</div>

					{/* Preview Section */}
					{trackId && (
						<div className="flex overflow-hidden flex-col rounded-lg bg-zinc-50 min-w-[240px] w-[340px] max-md:px-5">
							<TitleBadgeCard
								markColor="#8A8A8A"
								title="Preview"
								subComponent={<PreviewComponent />}
							>
								<PreviewCard
									artworkSrc={VINYL_RECORD}
									title={trackId?.fileName}
									duration={trackId.duration || 0}
									avatarSrc={userData?.profile_img || PROFILE_IMAGE}
									artistName={userData?.name || ""}
									isRotating={true}
								/>
							</TitleBadgeCard>
						</div>
					)}
				</div>
				{/* Submit Button */}
				<div className={`flex justify-end mt-6 ${!opportunity ? "" : "gap-5"}`}>
					{opportunity && (
						<Button
							className={`font-bold rounded-md  px-5 py-3 text-[15px] shadow transition-colors bg-videoBtnGreen text-[#0D5326]`}
							onPress={() => {
								router.back()
								showCustomModal({ customModalType: INVITE_COLLABORATOR_MODAL })
							}}
						>
							Back
						</Button>
					)}
					<Button
						type="submit"
						isLoading={isPending}
						className={` ${!opportunity ? "h-[48px] w-[128px]" : ""} px-5 py-3 gap-2 text-[15px] rounded-lg bg-gradient-to-b from-[#1DB954] to-[#0D5326] text-white hover:opacity-90 transition-opacity`}
					>
						{opportunity ? "Save" : "Create"}
					</Button>
				</div>
			</form>
		</FormProvider>
	)
}
