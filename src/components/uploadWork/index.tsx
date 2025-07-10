"use client"

import { useEffect, useState } from "react"
import { useForm, UseFormSetValue, useFormState } from "react-hook-form"
import { toast } from "react-toastify"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"

import {
	addTracksToProject,
	createTrack,
	deleteGoogleStorageFiles,
	updateTrack
} from "@/app/api/mutation"
import { fetchTrackDetails } from "@/app/api/query"
import { MEDIA_PREVIEW, MUSIC } from "@/assets"
import FileDisplay from "@/components/createProject/FileDisplay"
import ImageUpload from "@/components/createProject/ImageUpload"
import { CustomInput, TitleBadgeCard } from "@/components/ui"
import CategoryAttributes from "@/components/ui/categoryandatrribute/CategoryAttributes"
import TagsInput from "@/components/ui/categoryandatrribute/TagsInput"
import { AUDIO_VIDEO_MODAL, VIEW_LYRICS_MODAL } from "@/constant/modalType"
import { convertUrlToBlob, generateWaveformImage } from "@/helpers"
import { Category } from "@/types"
import { LivestreamFormData } from "@/types/livestream"
import { ImageData } from "@/types/uploadTypes"
import {
	UploadFormData,
	uploadSchema
} from "@/validationSchema/UploadWorkSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@nextui-org/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Trash2 } from "lucide-react"

import {
	useDynamicStore,
	useLibraryStore,
	useModalStore,
	useUserStore
} from "@/stores"
import { AudioFile } from "@/stores/dynamicStates"
import { useAddLyrics } from "@/hooks/useAddLyrics"
import { useFormNavigationAlert } from "@/hooks/useFormNavigationAlert"

import PreviewTrackList from "../createToken/PreviewTrackList"
import { UploadTrackModal } from "../modal"
import { ProfileFormValues } from "../profile/editProfile/PersonalInfo"
import { StyleAndSkillsFormValues } from "../profile/editProfile/StyleAndSkills"
import UploadTrack from "./uploadTrack"

export default function UploadNewWork() {
	const router = useRouter()
	const params = useParams()
	const {
		trackId,
		removeState,
		opportunity,
		linkTrack,
		updateState,
		postToSocial,
		schedulePostData,
		updateProjectTrack,
		isReleaseTrack,
		addState,
		mediaId,
		mediaExtension
	} = useDynamicStore()
	const { userData } = useUserStore()
	const { showCustomModal } = useModalStore()
	const queryClient = useQueryClient()
	const { lyricsInput, trackFiles } = useDynamicStore()

	const [instrumentsData, setInstrumentsData] = useState<Category[]>([])
	const [genresData, setGenresData] = useState<Category[]>([])
	const [imageSmall, setImageSmall] = useState<ImageData[]>([])
	const [imageBig, setImageBig] = useState<ImageData[]>([])

	const track_Id = params?.id

	const isUpdateTrack = track_Id ? true : false
	const {
		register,
		setValue,
		getValues,
		handleSubmit,
		resetField,
		watch,
		control,
		formState: { errors }
	} = useForm<UploadFormData>({
		resolver: zodResolver(uploadSchema),
		mode: "all",
		defaultValues: {
			productTitle: "",
			instruments: [],
			geners: [],
			tags: [],
			recordedFile: undefined,
			artwork: undefined
		}
	})

	const { isDirty } = useFormState({ control })

	// Form Navigation Alert
	useFormNavigationAlert({ formState: { isDirty } })

	const { instruments, genres } = useLibraryStore()

	const artwork = watch("artwork")

	const handleGenerateImages = async (url: string, index: number) => {
		try {
			// Generate small waveform image
			// const response = await fetch(trackId?.file)
			// if (!response.ok) {
			// 	throw new Error(`Failed to fetch audio file: ${response.statusText}`)
			// }

			// const audioBlob = await response.blob()

			const smallImage = await generateWaveformImage({
				audioUrl: url,
				resolution: 512 // Small resolution
			})
			setImageSmall([
				...imageSmall,
				{ dataUrl: smallImage.dataUrl, blob: smallImage.blob }
			]) // Store both
			const updatedTrackFiles = [...trackFiles]
			updatedTrackFiles[index].smallWaveformImage = smallImage.dataUrl
			updateState("TrackFiles", updatedTrackFiles)

			// Generate big waveform image
			const bigImage = await generateWaveformImage({
				audioUrl: url,
				resolution: 2048 // Large resolution
			})
			setImageBig([
				...imageBig,
				{ dataUrl: bigImage.dataUrl, blob: bigImage.blob }
			]) // Store both
		} catch (error) {
			console.error("Error generating waveform images:", error)
		}
	}

	const { mutate: addLyricsMutation } = useAddLyrics({
		onSuccess: () => {
			removeState("lyricsInput")
		}
	})

	const trackMutationFn = async (val: FormData) => {
		if (isUpdateTrack) {
			return updateTrack(track_Id as string, val)
		} else return createTrack(val)
	}

	const { mutate: addTrackToProject } = useMutation({
		mutationFn: (val: { projectId: string; trackIds: string[] }) =>
			addTracksToProject(val),
		onSuccess: (data) => {
			if (data) {
				toast.success("Track added to project successfully")
				queryClient.invalidateQueries({ queryKey: ["projectTracks"] })
				removeState("linkTrack")
			}
		},
		onError: (error: Error) => {
			if (error instanceof Error) {
				toast.error("Error: " + error.message)
			} else {
				toast.error("An unknown error occurred.")
			}
		}
	})

	const { mutate: deleteFile } = useMutation({
		mutationFn: (val: Record<string, string>) => deleteGoogleStorageFiles(val)
	})

	const { mutate, isPending } = useMutation({
		mutationFn: (val: FormData) => trackMutationFn(val),
		onSuccess: (data) => {
			if (data?._id || data?.acknowledged) {
				removeState("mediaExtension")
				removeState("mediaId")
				removeState("mediaSize")
				updateState("formNavigation", { isDirty: false })
				if (!isUpdateTrack) {
					toast.success("Track uploaded successfully")
				} else {
					toast.success("Track updated successfully")
				}
				updateState("trackId", {
					id: data._id
				})

				if (!isUpdateTrack && lyricsInput) {
					addLyricsMutation({
						userId: userData?._id as string,
						trackId: data?._id as string,
						title: "My Sample Song",
						lines: lyricsInput
					})
				}
				if (updateProjectTrack) {
					removeState("updateProjectTrack")
					queryClient.invalidateQueries({ queryKey: ["projectTracks"] })
					router.push(`/project/${updateProjectTrack}`)
				} else if (linkTrack) {
					addTrackToProject({
						projectId: linkTrack,
						trackIds: [data._id as string]
					})
					router.push(`/project/${linkTrack}`)
				} else if (opportunity) {
					removeState("opportunity")
					router.push(`/create-opportunity`)
				} else if (postToSocial || schedulePostData?.isSchedulePost) {
					removeState("postToSocial")
					removeState("schedulePostData")
					router.push(`/library`)
				} else if (isReleaseTrack) {
					addState("trackId", data)
					removeState("isReleaseTrack")
					router.push(`/create-track`)
				} else {
					router.push(`/library`)
				}
			} else {
				const payload = {
					fileName: `${mediaId}.${mediaExtension}`
				}
				deleteFile(payload)
			}
		},
		onError: (error: Error) => {
			const payload = {
				fileName: `${mediaId}.${mediaExtension}`
			}
			deleteFile(payload)
			if (error instanceof Error) {
				toast.error("Error: " + error.message)
			} else {
				toast.error("An unknown error occurred.")
			}
		}
	})

	const { data: trackDetails } = useQuery({
		queryKey: ["trackDetails", track_Id],
		queryFn: () => fetchTrackDetails(track_Id as string),
		enabled: !!track_Id,
		staleTime: 300000
	})

	const onSubmit = async (data: UploadFormData) => {
		if (!trackFiles?.length && !isUpdateTrack) {
			toast.error("No files to upload")
			return
		}

		try {
			if (!isUpdateTrack) {
				trackFiles.map(
					(
						file: {
							fileUrl: string
							mediaId: string
							mediaExtension: string
							mediaSize: string
							fileName: string
						},
						index: number
					) => {
						if (!file?.fileUrl || !file?.mediaId) {
							throw new Error(`Invalid file data at index ${index}`)
						}

						const formData = new FormData()

						// Add basic track info
						if (data?.productTitle) formData.append("name", data.productTitle)
						else formData.append("name", file?.fileName as string)
						formData.append("url", file.fileUrl)
						formData.append("_id", file.mediaId)
						formData.append("extension", file.mediaExtension)
						formData.append("fileSize", file.mediaSize.toString())

						// Add waveform images if available
						const waveformImage = imageSmall[index]
						const waveformImageBig = imageBig[index]
						if (waveformImage?.blob) {
							formData.append("imageWaveSmall", waveformImage.blob)
						}
						if (waveformImageBig?.blob) {
							formData.append("imageWaveBig", waveformImageBig.blob)
						}

						// Add artwork if provided
						if (data.artwork) {
							formData.append("artwork", data.artwork)
						}

						// Add arrays of data
						const arrayFields = {
							"instrument[]": data.instruments,
							"genre[]": data.geners,
							"tags[]": data.tags
						}

						Object.entries(arrayFields).forEach(([key, values]) => {
							if (Array.isArray(values)) {
								values.forEach((value) => formData.append(key, value))
							}
						})

						mutate(formData)
					}
				)
			} else {
				const formData = new FormData()

				// Add basic track info
				if (data?.productTitle) formData.append("name", data.productTitle)
				if (data.artwork) {
					formData.append("artwork", data.artwork)
				}

				// Add arrays of data
				const arrayFields = {
					"instrument[]": data.instruments,
					"genre[]": data.geners,
					"tags[]": data.tags
				}

				Object.entries(arrayFields).forEach(([key, values]) => {
					if (Array.isArray(values)) {
						values.forEach((value) => formData.append(key, value))
					}
				})
				mutate(formData)
			}
		} catch (error) {
			console.error("Upload failed:", error)
			toast.error("Failed to upload one or more files")
		}
	}

	useEffect(() => {
		if (trackFiles?.length) {
			trackFiles?.forEach((file: { fileUrl: string }, index: number) => {
				setValue("recordedFile", file?.fileUrl as string)
				handleGenerateImages(file?.fileUrl as string, index)
			})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [trackFiles])

	useEffect(() => {
		if (instruments.length) {
			const instrumentData = instruments.map((instrument) => ({
				label: instrument.title,
				value: instrument._id
			}))
			setInstrumentsData(instrumentData)
		}

		if (genres.length) {
			const genreData = genres.map((genre) => ({
				label: genre.title,
				value: genre._id
			}))
			setGenresData(genreData)
		}
	}, [instruments, genres])

	const showPreviewModal = () => {
		showCustomModal({ customModalType: AUDIO_VIDEO_MODAL })
	}

	const PreviewComponent = () => {
		return (
			<div
				className="flex gap-2.5 items-start self-stretch w-10 rounded-[40px] cursor-pointer"
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

	const DeleteComponent = () => {
		return (
			<div
				className="flex gap-2.5 items-start self-stretch w-10 rounded-[40px] cursor-pointer"
				onClick={() => {
					removeState("trackId")
					addState(
						"trackFiles",
						trackFiles?.filter(
							(item: Record<string, string>) =>
								item.fileName !== trackId.fileName
						)
					)
				}}
			>
				<Trash2 color="#b62b2b" />
			</div>
		)
	}

	useEffect(() => {
		if (trackDetails) {
			setValue("productTitle", trackDetails.name as string)

			if ((trackDetails?.artwork as string)?.length > 0) {
				convertUrlToBlob(trackDetails.artwork as string).then(
					(blob: Blob | null) => {
						if (blob) {
							setValue(
								"artwork",
								new File([blob], "artwork.png", { type: "image/png" })
							)
						}
					}
				)
			}
			setValue(
				"instruments",
				trackDetails.instrument.map((instrument) => instrument._id)
			)
			setValue(
				"geners",
				trackDetails.genre.map((genre) => genre._id)
			)
			setValue(
				"tags",
				trackDetails.tags.map((tag) => tag._id)
			)
			setValue("recordedFile", trackDetails.url as string)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [trackDetails])

	return (
		<>
			<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
				<div className="flex justify-between items-center w-full">
					<h1 className="text-4xl font-semibold tracking-tighter leading-tight text-zinc-800">
						Upload New Work
					</h1>
				</div>
				<div className="flex flex-wrap gap-2 items-start mt-6 w-full max-md:max-w-full">
					<div className="flex flex-col flex-1 shrink basis-12 min-w-[240px] max-md:max-w-full">
						{trackFiles?.length === 1 || isUpdateTrack ? (
							<TitleBadgeCard
								markColor="#8A8A8A"
								title="Name"
								titleClassName="!mb-0"
							>
								<div className="flex flex-col mt-8 w-full max-md:max-w-full">
									<CustomInput
										{...register("productTitle")}
										label="Track Name"
										{...(isUpdateTrack && {
											labelPart: "View Lyrics",
											labelPartClassName:
												"text-[#1DB954] cursor-pointer font-bold text-sm tracking-tighter leading-6"
										})}
										onLabelPartClick={() => {
											showCustomModal({
												customModalType: VIEW_LYRICS_MODAL,
												tempCustomModalData: {
													trackId: track_Id,
													userId: userData?._id,
													LyricsId: trackDetails?.lyrics?.[0]?._id
												}
											})
										}}
										type="text"
										id="productTitle"
										showTooltip
										tooltipText="Maximum 100 characters. No HTML or emoji allowed"
										errorMessage={errors.productTitle?.message || ""}
										isInvalid={!!errors.productTitle}
									/>
								</div>
							</TitleBadgeCard>
						) : (
							!trackFiles?.length && (
								<TitleBadgeCard
									markColor="#8A8A8A"
									title="Upload File"
									titleClassName="!mb-0"
								>
									<div className="flex flex-col mt-8 w-full">
										<UploadTrack />
									</div>
								</TitleBadgeCard>
							)
						)}
						{!isUpdateTrack && trackId?.fileUrl && (
							<TitleBadgeCard
								markColor="#8A8A8A"
								title="Uploaded File"
								titleClassName="!mb-0"
								subComponent={<DeleteComponent />}
							>
								<FileDisplay
									label={trackId?.mediaType === "audio" ? "Music" : "Video"}
									fileName={trackId?.fileName}
									duration={(trackId as AudioFile)?.duration || 0}
									iconSrc={MUSIC}
									error={errors.recordedFile?.message}
									smallWaveformImage={trackId?.smallWaveformImage}
								/>
							</TitleBadgeCard>
						)}

						<TitleBadgeCard
							markColor="#8A8A8A"
							title="Artwork"
							titleClassName="!mb-0"
						>
							<div className="flex flex-col mt-8 w-full">
								<ImageUpload
									onImageUpload={(file) => {
										setValue("artwork", file, { shouldDirty: true })
									}}
									onRemove={() => {
										resetField("artwork")
									}}
									error={errors.artwork?.message}
									// disabled={isUpdateTrack}
									artworkUrl={(trackDetails?.artwork as string) || ""}
									rawArtworkUrl={artwork as File}
								/>
							</div>
						</TitleBadgeCard>

						<TitleBadgeCard
							markColor="#8A8A8A"
							title="Category & attibutes"
							titleClassName="!mb-0"
						>
							<div className="flex flex-col mt-8 w-full max-md:max-w-full">
								<CategoryAttributes
									title="Instruments"
									categories={instrumentsData}
									tooltipContent="Select the instruments you used in this work"
									setValue={
										setValue as UseFormSetValue<
											| UploadFormData
											| ProfileFormValues
											| StyleAndSkillsFormValues
										>
									}
									getValues={getValues}
									name="instruments"
									defaultValue={
										trackDetails?.instrument &&
										trackDetails?.instrument?.length > 0
											? trackDetails?.instrument.map(
													(instrument) => instrument._id
												)
											: []
									}
								/>

								{/* {errors.instruments && (
									<p className="text-red-500 text-sm mt-2">
										{errors.instruments?.message}
									</p>
								)} */}
								<CategoryAttributes
									title="Genres"
									categories={genresData}
									tooltipContent="Select the genres that describe your work"
									setValue={
										setValue as UseFormSetValue<
											| UploadFormData
											| ProfileFormValues
											| StyleAndSkillsFormValues
										>
									}
									name="geners"
									getValues={getValues}
									// error={errors.geners?.message}
									defaultValue={
										trackDetails?.genre && trackDetails.genre.length > 0
											? trackDetails.genre.map((genre) => genre._id)
											: undefined
									}
								/>

								<div className="flex flex-col mt-8 w-full">
									<TagsInput
										title="Tags"
										tooltipContent="You can add up to 12 descriptive tags for your item."
										maxTags={12}
										setValue={
											setValue as UseFormSetValue<
												UploadFormData | LivestreamFormData
											>
										}
										defaultValue={
											trackDetails?.tags && trackDetails.tags.length > 0
												? trackDetails.tags.map((tag) => tag._id)
												: []
										}
									/>
									{/* {errors.tags && (
											<p className="text-red-500 text-sm mt-2">
												{errors.tags?.message}
											</p>
										)} */}
								</div>
							</div>
						</TitleBadgeCard>
					</div>

					{/* Preview Section */}
					{!isUpdateTrack && (
						<div className="flex overflow-hidden flex-col rounded-lg bg-zinc-50 min-w-[240px] w-[340px] max-md:px-5">
							<TitleBadgeCard
								markColor="#8A8A8A"
								title="Preview"
								subComponent={<PreviewComponent />}
							>
								<PreviewTrackList />
							</TitleBadgeCard>
						</div>
					)}
				</div>
				{/* Buttons Section */}
				<div className="flex justify-end mt-6 gap-4">
					{opportunity ||
						(postToSocial && (
							<Button
								type="button"
								onPress={() => {
									router.back()
								}}
								className="w-[92px] h-[48px] px-5 py-3 gap-2 rounded-lg bg-[#DDF5E5] text-[#0D5326] font-bold"
							>
								Back
							</Button>
						))}

					<Button
						type="submit"
						isLoading={isPending}
						isDisabled={!isUpdateTrack && !trackFiles?.length}
						className="w-[92px] h-[48px] px-5 py-3 gap-2 rounded-lg bg-btnColor text-white font-bold"
					>
						{isUpdateTrack ? "Update" : "Upload"}
					</Button>
				</div>
			</form>

			<UploadTrackModal setValue={setValue} />
		</>
	)
}
