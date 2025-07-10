"use client"

import { FC } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"

import { updateTrack } from "@/app/api/mutation"
import { Folder } from "@/components/library"
import { CustomSingleSelect } from "@/components/ui/customSingleSelect"
import { MOVE_FILE_MODAL } from "@/constant/modalType"
import { FILE_MOVED_SUCCESSFULLY } from "@/constant/toastMessages"
import { FolderMovePayload } from "@/types"
import { Button, ModalBody, ModalFooter, ModalHeader } from "@nextui-org/react"
import { useMutation } from "@tanstack/react-query"

import { useDynamicStore, useModalStore } from "@/stores"
import useMediaList from "@/hooks/useMediaList"

import CustomModal from "../CustomModal"

type ResetForm = {
	folder: string
}

const MoveFileModal: FC = () => {
	const { tempCustomModalData, hideCustomModal, customModalType } =
		useModalStore()
	const { folderList } = useDynamicStore()
	const { fetchMediaDataList } = useMediaList()

	const options =
		folderList?.data?.length &&
		folderList?.data?.map((item: Folder) => ({
			key: item._id,
			label: item.name
		}))

	const {
		register,
		handleSubmit,
		formState: { errors },
		watch
	} = useForm<ResetForm>()

	const folder = watch("folder")

	const hideModal = () => {
		hideCustomModal()
	}
	const { mutate, isPending } = useMutation({
		mutationFn: (payload: FolderMovePayload) =>
			updateTrack(tempCustomModalData?._id, { folder_id: payload.folder_id }),
		onSuccess: (data) => {
			if (data) {
				fetchMediaDataList()
				toast.success(FILE_MOVED_SUCCESSFULLY)
				hideModal()
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

	const onSubmit = (data: ResetForm) => {
		const payload = {
			folder_id: data.folder
		}
		mutate(payload)
	}

	return (
		<CustomModal
			onClose={hideModal}
			showModal={customModalType === MOVE_FILE_MODAL}
			size="md"
		>
			<ModalHeader className="text-lg font-bold">Move In Folder</ModalHeader>
			<ModalBody>
				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="mb-4">
						<CustomSingleSelect
							placeholder="Select a folder"
							errorMessage={errors?.folder?.message || ""}
							isInvalid={!!errors?.folder}
							options={options}
							selectedValue={folder ? [folder] : []}
							{...register("folder")}
						/>
					</div>
					<ModalFooter className="px-0">
						<Button
							onPress={hideModal}
							color="primary"
							variant="bordered"
							className="border-[#0575e6] text-[#0575e6]"
						>
							CANCEL
						</Button>
						<Button
							type="submit"
							variant="solid"
							className="bg-green-600 text-white"
							isLoading={isPending}
							isDisabled={!folder}
						>
							Move File
						</Button>
					</ModalFooter>
				</form>
			</ModalBody>
		</CustomModal>
	)
}

export default MoveFileModal
