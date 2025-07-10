"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"

import { createCommunityTopic, updateCommunityTopic } from "@/app/api/mutation"
import { fetchForums, fetchTopicById } from "@/app/api/query"
import { CustomInput } from "@/components/ui"
import Savebtn from "@/components/ui/savebtn/savebtn"
import TextEditor from "@/components/ui/textEditor/TextEditor"
import { POST_COMMUNITY_TOPIC_MODAL } from "@/constant/modalType"
import { Spinner } from "@nextui-org/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { useModalStore } from "@/stores"

import CustomModal from "../CustomModal"
import { DropdownField } from "../digitalAdsModal/common/FormFields"

interface FormData {
	title: string
	forum: string
	description: string
}

export default function PostCommunityTopicModal() {
	const { customModalType, hideCustomModal, tempCustomModalData } =
		useModalStore()

	const topicId = tempCustomModalData?.topicId as string | undefined
	const isEditMode = !!topicId

	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
		watch,
		reset
	} = useForm<FormData>({
		defaultValues: {
			title: "",
			forum: "",
			description: ""
		}
	})

	const { data: forums = [] } = useQuery({
		queryKey: ["forums"],
		queryFn: fetchForums,
		staleTime: 1000 * 60 * 5,
		enabled: !!(customModalType === POST_COMMUNITY_TOPIC_MODAL)
	})

	const { data: topicData, isLoading: isTopicLoading } = useQuery({
		queryKey: ["topicById", topicId],
		queryFn: () => fetchTopicById(topicId!),
		enabled: isEditMode && customModalType === POST_COMMUNITY_TOPIC_MODAL
	})

	const queryClient = useQueryClient()

	const { mutate: createTopic, isPending: isCreating } = useMutation({
		mutationFn: createCommunityTopic,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["topics"] }).then(() => {
				hideCustomModal()
				reset({
					title: "",
					forum: "",
					description: ""
				})
				toast.success("Topic shared successfully")
			})
		}
	})

	const { mutate: updateTopic, isPending: isUpdating } = useMutation({
		mutationFn: updateCommunityTopic,
		onSuccess: (data) => {
			if (data) {
				queryClient.invalidateQueries({ queryKey: ["topics"] })
				queryClient.invalidateQueries({ queryKey: ["topicById", topicId] })
				hideCustomModal()
				reset({
					title: "",
					forum: "",
					description: ""
				})
				toast.success("Topic updated successfully")
			}
		}
	})

	const onSubmit = (data: FormData) => {
		const selectedForum = forums.find((forum) => forum._id === data.forum)

		if (!selectedForum) return

		const payload = {
			title: data.title,
			...(!isEditMode && { forumName: selectedForum.name }),
			description: data.description,
			forumId: data.forum
		}

		if (isEditMode) {
			updateTopic({ topicId: topicId!, payload })
		} else {
			createTopic({ ...payload, forumName: selectedForum.name })
		}
	}

	const selectedForumName =
		forums.find((forum) => forum._id === watch("forum"))?.name || ""

	const handleClose = () => {
		hideCustomModal()
		reset({
			title: "",
			forum: "",
			description: ""
		})
	}

	const isPending = isCreating || isUpdating

	useEffect(() => {
		if (isEditMode && topicData) {
			reset({
				title: topicData.title,
				forum: topicData.forumId._id,
				description: topicData.description
			})
		}
	}, [isEditMode, topicData, reset])

	const forumOptions = forums.map((forum) => ({
		key: forum._id,
		label: forum.name
	}))

	return (
		<CustomModal
			showModal={customModalType === POST_COMMUNITY_TOPIC_MODAL}
			onClose={handleClose}
			size="2xl"
			modalBodyClass="p-6 max-w-[540px]"
		>
			{isEditMode && isTopicLoading ? (
				<div className="flex justify-center items-center min-h-[200px]">
					<Spinner size="lg" color="default" />
				</div>
			) : (
				<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
					<h2 className="font-manrope font-bold text-[14px] leading-[150%] tracking-[-0.015em] text-[#33383F]">
						{isEditMode ? "Edit Topic" : "Add New Topic"}
					</h2>

					<div className="flex flex-col gap-4">
						<CustomInput
							label="Title"
							type="text"
							{...register("title", { required: "Title is required" })}
							isInvalid={!!errors.title}
							errorMessage={errors.title?.message}
							classname="w-full !bg-white !border-2 !border-customGray !rounded-xl !p-3 !text-sm"
							labelClassName="text-inputLabel font-semibold text-[14px] leading-[24px] tracking-[-0.01em]"
						/>

						<DropdownField
							label="Forum"
							value={selectedForumName}
							onChange={(value) =>
								setValue("forum", value, { shouldValidate: true })
							}
							options={forumOptions}
						/>

						<div className="space-y-2">
							<label className="text-inputLabel font-semibold text-[14px] leading-[24px] tracking-[-0.01em]">
								Add Description
							</label>
							<TextEditor
								value={watch("description")}
								onChange={(value) =>
									setValue("description", value, { shouldValidate: true })
								}
							/>
							{errors.description && (
								<p className="text-red-500 text-sm">
									{errors.description.message}
								</p>
							)}
						</div>
					</div>

					<div className="flex justify-end mt-2">
						<Savebtn
							isLoading={isPending}
							className="w-fit self-end bg-btnColor text-white px-4 py-2 rounded-lg text-[13px] hover:bg-btnColorHover leading-[24px] font-bold tracking-[-0.01em]"
							label={isEditMode ? "Update" : "Post"}
							type="submit"
							onClick={handleSubmit(onSubmit)}
							disabled={
								!watch("title") ||
								!watch("forum") ||
								!watch("description") ||
								isPending
							}
						/>
					</div>
				</form>
			)}
		</CustomModal>
	)
}
