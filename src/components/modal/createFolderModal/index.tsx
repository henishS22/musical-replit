import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"

import { createFolder, UpdateFolder } from "@/app/api/mutation"
import { CustomInput } from "@/components/ui/customInput"
import { CREATE_FOLDER_MODAL } from "@/constant/modalType"
import {
	FOLDER_CREATED_SUCCESSFULLY,
	FOLDER_UPDATED_SUCCESSFULLY
} from "@/constant/toastMessages"
import { zodResolver } from "@hookform/resolvers/zod"
import {
	Button,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader
} from "@nextui-org/react"
import { useMutation } from "@tanstack/react-query"
import { z } from "zod"

import { useModalStore } from "@/stores"

import CustomModal from "../CustomModal"

const folderSchema = z.object({
	name: z.string().min(1, "Folder name is required")
})

type FolderFormData = z.infer<typeof folderSchema>

interface CreateFolderModalProps {
	folderId: string | number
	folderName: string
	onCreateFolder: () => void
}

export function CreateFolderModal({
	folderId,
	folderName,
	onCreateFolder
}: CreateFolderModalProps) {
	const { hideCustomModal, customModalType } = useModalStore()
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
		setValue
	} = useForm<FolderFormData>({
		resolver: zodResolver(folderSchema),
		defaultValues: {
			name: ""
		}
	})

	const { mutate, isPending } = useMutation({
		mutationFn: (val: Record<string, string | number | object>) =>
			createFolder(val),
		onSuccess: (data) => {
			if (data) {
				onCreateFolder()
				reset()
				hideCustomModal()
				toast.success(FOLDER_CREATED_SUCCESSFULLY)
			}
		},
		onError: (error) => {
			console.error("error:", error)
		}
	})

	const { mutate: UpdateFolderName, isPending: isFolderUpdateLoading } =
		useMutation({
			mutationFn: async (data: FolderFormData) => {
				const response = await UpdateFolder({
					payload: { id: folderId, name: data.name },
					method: "PUT"
				})
				return response
			},
			onSuccess: (data) => {
				if (data) {
					onCreateFolder()
					toast.success(FOLDER_UPDATED_SUCCESSFULLY)
					hideCustomModal()
				}
			}
		})

	const onSubmit = (data: FolderFormData) => {
		// onCreateFolder(data)
		if (folderId) {
			UpdateFolderName(data)
		} else {
			mutate(data)
		}
	}

	useEffect(() => {
		if (folderName) {
			setValue("name", folderName)
		} else {
			setValue("name", "")
		}
		return () => {
			reset()
		}
	}, [folderName, setValue, reset])

	return (
		<CustomModal
			onClose={onCreateFolder}
			showModal={customModalType === CREATE_FOLDER_MODAL}
			size="sm"
		>
			<ModalContent>
				<form onSubmit={handleSubmit(onSubmit)}>
					<ModalHeader className="flex justify-between items-center">
						<h3 className="text-lg font-semibold">
							{folderId ? "Edit Folder" : "Create New Folder"}
						</h3>
					</ModalHeader>

					<ModalBody>
						<CustomInput
							type="text"
							label="Folder Name"
							{...register("name")}
							isInvalid={!!errors.name}
							errorMessage={errors.name?.message}
						/>
					</ModalBody>

					<ModalFooter className="flex gap-2">
						<Button variant="bordered" onPress={onCreateFolder}>
							Cancel
						</Button>
						<Button
							color="primary"
							type="submit"
							isLoading={isPending || isFolderUpdateLoading}
						>
							{folderId ? "Update" : "Create"}
						</Button>
					</ModalFooter>
				</form>
			</ModalContent>
		</CustomModal>
	)
}
