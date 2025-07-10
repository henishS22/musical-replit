"use client"

import { toast } from "react-toastify"

import { unPublishCreatorQuest } from "@/app/api/mutation"
import { ALERT_ICON } from "@/assets"
import { ArtworkModal } from "@/components/dashboard/create-module/artwork-modal"
import CustomModal from "@/components/modal/CustomModal"
import { PUUBLISHUNPUBLISH_MODAL } from "@/constant/modalType"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { useModalStore } from "@/stores"

export function PublishUnpublishModal() {
	const { hideCustomModal, customModalType, tempCustomModalData } =
		useModalStore()
	const queryClient = useQueryClient()

	const { mutate, isPending } = useMutation({
		mutationKey: ["publishUnpublish"],
		mutationFn: (payload: { isPublished: boolean; creatorQuestId: string }) =>
			unPublishCreatorQuest(payload),
		onSuccess: (data) => {
			if (data && data.status !== "error") {
				queryClient.invalidateQueries({ queryKey: ["inprogress"] })
				toast.success(
					`Quest ${!tempCustomModalData?.isPublished ? "Published" : "Unpublished"}`
				)
				hideCustomModal()
			}
		}
	})

	const handleOnclick = () => {
		mutate({
			isPublished: !tempCustomModalData?.isPublished,
			creatorQuestId: tempCustomModalData?.creatorQuestId
		})
	}

	return (
		<CustomModal
			onClose={hideCustomModal}
			size="5xl"
			modalBodyClass="max-w-[540px]"
			showModal={customModalType === PUUBLISHUNPUBLISH_MODAL}
		>
			<ArtworkModal
				icon={{
					src: ALERT_ICON,
					alt: "icon",
					bgColor: "bg-[#F5F1DD]"
				}}
				title={`Do you want to ${!tempCustomModalData?.isPublished ? "publish" : "unpublish"} this Missions?`}
				headClasses={{
					title:
						"!font-bold !text-md !text-[#0A1629] !leading-[24px] !tracking-[0px]",
					description:
						"!font-medium !text-[15px] leading-[24px] tracking-[-0.01em] !text-textGray"
				}}
				description={""}
				existingProject={{
					text: "No, Cancel",
					onClick: () => hideCustomModal()
				}}
				newProject={{
					text: "Yes, Confirm",
					onClick: handleOnclick,
					isLoading: isPending
				}}
				padding="p-10"
				media={false}
				modalSteps={0}
			/>
		</CustomModal>
	)
}
