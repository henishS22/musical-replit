"use client"

import {
	FormProvider,
	SubmitHandler,
	useForm,
	UseFormSetValue
} from "react-hook-form"
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"

import { createLiveStream } from "@/app/api/mutation"
import { fetchNftsByUser } from "@/app/api/query"
import ImageUpload from "@/components/createProject/ImageUpload"
import { TitleBadgeCard } from "@/components/ui"
import { SCHEDULE_POST_MODAL } from "@/constant/modalType"
import { formatToISO } from "@/helpers/common"
import { LivestreamFormData, ScheduleData } from "@/types/livestream"
import { livestreamSchema } from "@/validationSchema/livestreamSchema"
import { UploadFormData } from "@/validationSchema/UploadWorkSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@nextui-org/react"
import { useMutation, useQuery } from "@tanstack/react-query"

import { useDynamicStore, useModalStore, useUserStore } from "@/stores"
import { useFormNavigationAlert } from "@/hooks/useFormNavigationAlert"

import TagsInput from "../ui/categoryandatrribute/TagsInput"
import CustomTooltip from "../ui/tooltip"
import AccessControl from "./AccesControl"
import BasicInfo from "./BaiscInfo"
import LivestreamType from "./LivestreamType"

export const LiveStream = () => {
	const { showCustomModal } = useModalStore()
	const { removeState, updateState } = useDynamicStore()
	const { user } = useUserStore()
	const router = useRouter()

	const methods = useForm<LivestreamFormData>({
		resolver: zodResolver(livestreamSchema),
		defaultValues: {
			title: "",
			description: "",
			artwork: undefined,
			livestreamType: "",
			accessType: "public",
			nftId: []
		}
	})

	const {
		setValue,
		watch,
		handleSubmit,
		trigger,
		resetField,
		formState: { errors, isDirty }
	} = methods

	useFormNavigationAlert({ formState: { isDirty } })

	const { data, isPending } = useQuery({
		queryKey: ["nftsByUser"],
		queryFn: fetchNftsByUser,
		staleTime: 1000 * 60 * 60 * 24,
		enabled: !!user?.id
	})

	const { mutate: createLiveStreamMutation, isPending: isCreating } =
		useMutation({
			mutationFn: createLiveStream,
			onSuccess: (data) => {
				if (data) {
					updateState("formNavigation", { isDirty: false })
					const accessType = watch("accessType")
					if (accessType === "public") {
						router.push("/featured-livestream")
					} else {
						router.push(`/dashboard`)
					}
					removeState("schedulePostData")
					toast.success("Livestream created successfully!")
				}
			}
		})

	const handleSchedule = async () => {
		const isValid = await trigger()
		if (isValid) {
			const formData = watch()
			showCustomModal({
				customModalType: SCHEDULE_POST_MODAL,
				tempCustomModalData: {
					livestream: true
				},
				modalFunction: () => {
					const scheduleData = useDynamicStore.getState().schedulePostData
					handleFormSubmit(formData, scheduleData)
				}
			})
		}
	}

	const handleFormSubmit = (
		data: LivestreamFormData,
		scheduleData?: ScheduleData
	) => {
		const formData = new FormData()
		formData.append("title", data?.title)
		formData.append("description", data?.description)
		formData.append("type", data?.livestreamType)
		formData.append("accessControl", data?.accessType)

		if (data?.artwork) {
			formData.append("artwork", data?.artwork)
		}

		if (scheduleData?.scheduleDate && scheduleData?.scheduleTime) {
			formData.append(
				"scheduleDate",
				formatToISO(scheduleData.scheduleDate, scheduleData.scheduleTime)
			)
		}

		if (data?.accessType === "private" && data?.nftId?.length) {
			if (data?.nftId?.length) {
				data?.nftId?.forEach((id, index) => {
					formData.append(`nftIds[${index}]`, id)
				})
			}
		}
		createLiveStreamMutation(formData)
	}

	const onSubmit: SubmitHandler<LivestreamFormData> = (data) => {
		handleFormSubmit(data)
	}

	return (
		<FormProvider {...methods}>
			<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
				<h1 className="text-4xl font-semibold tracking-tighter leading-tight text-zinc-800">
					Start a Livestream
				</h1>

				{/* title & description section */}
				<BasicInfo />

				<TitleBadgeCard
					markColor="#B1E5FC"
					title="Artwork"
					titleClassName="!mb-0"
				>
					<div className="flex flex-col w-full gap-4 mt-8">
						<span className="flex items-center gap-1">
							Cover image{" "}
							<CustomTooltip tooltipContent="Upload an image for your livestream" />
						</span>
						<ImageUpload
							onImageUpload={(file) =>
								setValue("artwork", file, { shouldDirty: true })
							}
							onRemove={() => resetField("artwork")}
						/>
					</div>
					{errors.artwork && (
						<p className="text-red-500 text-sm mt-2">
							{errors.artwork.message as string}
						</p>
					)}
				</TitleBadgeCard>

				{/* livestreamType section */}
				<LivestreamType />

				{/* accessControl section */}
				<AccessControl />

				{/* nft selection section */}
				{methods.watch("accessType") === "private" && (
					<TitleBadgeCard
						markColor="#FFBC99"
						title="Tokens"
						titleClassName="!mb-0"
					>
						<div className="flex flex-col mt-2 w-full">
							<TagsInput
								setValueData="nftId"
								title="Select tokens"
								tooltipContent="You can add up to 12 descriptive tags for your item."
								setValue={
									setValue as UseFormSetValue<
										UploadFormData | LivestreamFormData
									>
								}
								data={data?.tokensCreatedByWallet || []}
								isLoading={isPending}
								placeholder="Select"
							/>
						</div>
					</TitleBadgeCard>
				)}

				<div className="flex justify-end mt-6 gap-4">
					<Button
						isLoading={isCreating}
						type="button"
						onPress={handleSchedule}
						className="px-5 py-3 gap-2 rounded-lg bg-btnColor text-white font-bold"
					>
						Schedule
					</Button>
				</div>
			</form>
		</FormProvider>
	)
}
