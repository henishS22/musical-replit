"use client"

import React from "react"
import { FormProvider, useForm } from "react-hook-form"
import { toast } from "react-toastify"

import { publishCreatorQuest, updateCreatorQuest } from "@/app/api/mutation"
import ChipInput from "@/components/ui/chipInput/ChipInput"
import { MissionsIconMap } from "@/helpers"
import { CreatorQuestPayload } from "@/types/missionTypes"
import { CreatorQuestSchema } from "@/validationSchema/missionsSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@nextui-org/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { z } from "zod"

import { useDynamicStore, useModalStore } from "@/stores"

import { TextArea } from "./TextArea"

type FormValues = z.infer<typeof CreatorQuestSchema>

export const TwitterPostForm: React.FC = () => {
	const { tempCustomModalData, hideCustomModal } = useModalStore()
	const queryClient = useQueryClient()
	const { removeState } = useDynamicStore()
	const methods = useForm<FormValues>({
		resolver: zodResolver(CreatorQuestSchema),
		defaultValues: {
			instruction: tempCustomModalData?.description || "",
			caption: tempCustomModalData?.metaData?.caption || "",
			hashtags: tempCustomModalData?.metaData?.hashtags || [],
			mentions: tempCustomModalData?.metaData?.mentions || []
		}
	})

	const updateMutation = useMutation({
		mutationKey: ["updateCreatorQuest"],
		mutationFn: (payload: CreatorQuestPayload) => updateCreatorQuest(payload),
		onSuccess: (data) => {
			if (data && data.status !== "error") {
				toast.success("Quest Updated Successfully")
				hideCustomModal()
				removeState("mentions")
				removeState("hashtags")
				queryClient.invalidateQueries({ queryKey: ["inprogress"] })
			}
		}
	})

	const createMutation = useMutation({
		mutationKey: ["publishCreatorQuest"],
		mutationFn: (payload: CreatorQuestPayload) => publishCreatorQuest(payload),
		onSuccess: (data) => {
			if (data && data.status !== "error") {
				toast.success("Quest Created Successfully")
				hideCustomModal()
				removeState("mentions")
				removeState("hashtags")
				queryClient.invalidateQueries({ queryKey: ["inprogress"] })
			}
		}
	})

	const onSubmit = (data: FormValues) => {
		const isUpdate = !!tempCustomModalData?.creatorQuestId

		const payload = {
			[isUpdate ? "creatorQuestId" : "questId"]:
				tempCustomModalData?.creatorQuestId || tempCustomModalData?.questId,
			isPublished: true,
			description: data.instruction,
			metaData: {
				caption: data.caption,
				mentions: data.mentions.map((m) => (m.startsWith("@") ? m : `@${m}`)),
				hashtags: data.hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`))
			}
		}

		if (isUpdate) {
			updateMutation.mutate(payload)
		} else {
			createMutation.mutate(payload)
		}
	}

	return (
		<FormProvider {...methods}>
			<form
				onSubmit={methods.handleSubmit(onSubmit)}
				className="flex flex-col gap-3 justify-center items-center p-4 w-full rounded-lg"
			>
				<span className="max-w-[56px] max-h-[56px]">
					{MissionsIconMap[tempCustomModalData?.identifier]}
				</span>
				<div className="flex flex-col gap-3 items-center">
					<h2 className="w-full text-base font-bold leading-6 text-center text-slate-900">
						{tempCustomModalData?.title}
					</h2>
					<p className="w-full text-sm font-bold leading-5 text-center text-neutral-400">
						Publish a Mission to your Community.
					</p>
				</div>

				<TextArea
					label="Enter Instruction to complete the mission"
					{...methods.register("instruction")}
					error={methods.formState.errors.instruction?.message}
					readOnly={tempCustomModalData?.ReadOnly}
				/>

				<TextArea
					label="Enter Caption"
					{...methods.register("caption")}
					error={methods.formState.errors.caption?.message}
					readOnly={tempCustomModalData?.ReadOnly}
				/>

				<div className="flex flex-col gap-1 items-start w-full">
					<label className="w-full text-sm font-bold tracking-tight leading-5 h-[21px] text-neutral-700">
						Enter Hashtags
					</label>
					<ChipInput
						prefix="#"
						fieldName="hashtags"
						ReadOnly={tempCustomModalData?.ReadOnly}
					/>
					{methods.formState.errors.hashtags && (
						<span className="text-red-500 text-sm">
							{methods.formState.errors.hashtags.message}
						</span>
					)}
				</div>

				<div className="flex flex-col gap-1 items-start w-full">
					<label className="w-full text-sm font-bold tracking-tight leading-5 h-[21px] text-neutral-700">
						Enter Mentions
					</label>
					<ChipInput
						prefix="@"
						fieldName="mentions"
						ReadOnly={tempCustomModalData?.ReadOnly}
					/>
					{methods.formState.errors.mentions && (
						<span className="text-red-500 text-sm">
							{methods.formState.errors.mentions.message}
						</span>
					)}
				</div>

				<Button
					type="submit"
					isLoading={createMutation.isPending || updateMutation.isPending}
					isDisabled={
						createMutation.isPending ||
						updateMutation.isPending ||
						tempCustomModalData?.ReadOnly
					}
					className="w-[92px] h-[48px] px-5 py-3 gap-2 rounded-lg bg-btnColor text-white font-bold"
				>
					Submit
				</Button>
			</form>
		</FormProvider>
	)
}
