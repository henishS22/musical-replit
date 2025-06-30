import { useCallback, useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"

import { updateProjectCollaborators } from "@/app/api/mutation"
import { fetchProject } from "@/app/api/query"
import { MEMBER } from "@/assets"
import CollaboratorSection from "@/components/createProject/collaborator/CollaboratorSection"
import {
	ROLE_REQUIRED,
	SPLIT_PERCENTAGE_REQUIRED
} from "@/constant/errorMessage"
import { ADD_COLLAB_MODAL } from "@/constant/modalType"
import {
	COLLABORATORS_ADDED_FAILED,
	COLLABORATORS_ADDED_SUCCESSFULLY
} from "@/constant/toastMessages"
import {
	formatCollaborators,
	formatUpdatePayload
} from "@/helpers/collaboratorHelpers"
import { collabDetails, ProjectCollaborator } from "@/types"
import { collaboratorSchema } from "@/validationSchema/CreateProjectSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button, ModalBody, ModalContent } from "@nextui-org/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { z } from "zod"

import { useUserStore } from "@/stores"
import { useDynamicStore } from "@/stores/dynamicStates"
import { useModalStore } from "@/stores/modal"

import CustomModal from "../CustomModal"

const collaboratorFormSchema = z.object({
	collaborators: z.array(collaboratorSchema)
})

type CollaboratorFormData = z.infer<typeof collaboratorFormSchema>

const AddCollabModal = () => {
	const { hideCustomModal, customModalType, tempCustomModalData } =
		useModalStore()
	const { addState, updateState, selectedUser } = useDynamicStore()
	const { userData } = useUserStore()
	const projectId = (tempCustomModalData as Record<string, string>)
		?.selectedProjectId
	const queryClient = useQueryClient()
	const form = useForm<CollaboratorFormData>({
		resolver: zodResolver(collaboratorFormSchema),
		mode: "onSubmit",
		defaultValues: {
			collaborators: []
		}
	})

	const {
		setValue,
		formState: { errors },
		watch,
		trigger,
		handleSubmit
	} = form

	const collaborators: collabDetails[] = watch("collaborators")

	const { data: projectData, isPending: isProjectLoading } = useQuery({
		queryKey: ["project", projectId],
		queryFn: () => fetchProject(projectId),
		enabled: !!projectId
	})

	const handleClose = useCallback(() => {
		updateState("collabData", {
			formattedCollaborators: [],
			isProjectLoading: false
		})
		hideCustomModal()
	}, [updateState, hideCustomModal])

	const { mutate: updateCollaborators, isPending } = useMutation({
		mutationFn: () => {
			const formattedPayload = formatUpdatePayload(collaborators)
			return updateProjectCollaborators(projectId, formattedPayload)
		},
		onSuccess: (data) => {
			if (data) {
				toast.success(COLLABORATORS_ADDED_SUCCESSFULLY)
				queryClient.invalidateQueries({ queryKey: ["project"] })
				handleClose()
			}
		},
		onError: () => {
			toast.error(COLLABORATORS_ADDED_FAILED)
		}
	})

	const updateCollaboratorsData = useCallback(() => {
		if (
			!isProjectLoading &&
			projectData &&
			customModalType === ADD_COLLAB_MODAL
		) {
			const formattedCollaborators = formatCollaborators(
				projectData?.collaborators as ProjectCollaborator[]
			)

			const ownerCollaborator = {
				name: userData?.name || "Unknown User",
				userId: userData?._id,
				image: userData?.profile_img || MEMBER,
				permission: "Owner",
				split: projectData?.split,
				roles: projectData?.ownerRoles?.map((role) => role?._id) || []
			}

			const newCollaborator = selectedUser?._id
				? {
						name: selectedUser?.name || "Unknown",
						userId: selectedUser?._id,
						image: selectedUser?.image || "",
						permission: "View only",
						split: 0,
						roles: []
					}
				: null

			const isExistingCollaborator =
				newCollaborator &&
				(formattedCollaborators?.some(
					(collab) => collab.userId === newCollaborator.userId
				) ||
					ownerCollaborator.userId === newCollaborator.userId)

			const updatedCollaborators = [
				ownerCollaborator,
				...(formattedCollaborators || []),
				...(newCollaborator && !isExistingCollaborator ? [newCollaborator] : [])
			]

			addState("collabData", {
				formattedCollaborators: updatedCollaborators,
				isProjectLoading: false
			})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isProjectLoading, projectData, selectedUser, userData])

	useEffect(() => {
		updateCollaboratorsData()
	}, [updateCollaboratorsData])

	useEffect(() => {
		trigger("collaborators")
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [collaborators])

	const errorMessage = useMemo(() => {
		if (errors?.collaborators?.message) {
			return errors.collaborators.message
		}
		// Check if any collaborator has split error
		const hasSplitError =
			Array.isArray(collaborators) &&
			collaborators.some(
				(_, index) => errors?.collaborators?.[index]?.split?.message
			)

		if (hasSplitError) {
			return SPLIT_PERCENTAGE_REQUIRED
		}
		// Check if any collaborator has empty roles
		const hasEmptyRoles =
			Array.isArray(collaborators) &&
			collaborators.some(
				(_, index) => errors?.collaborators?.[index]?.roles?.message
			)

		if (hasEmptyRoles) {
			return ROLE_REQUIRED
		}

		return null
	}, [collaborators, errors?.collaborators])

	const onSubmit = handleSubmit(() => {
		updateCollaborators()
	})

	return (
		<CustomModal
			onClose={handleClose}
			showModal={customModalType === ADD_COLLAB_MODAL}
			size="3xl"
		>
			<ModalContent>
				<ModalBody>
					<form onSubmit={onSubmit} className="mt-2">
						<CollaboratorSection setValue={setValue} />
						{errorMessage && (
							<p className="text-red-500 text-sm mt-2">{errorMessage}</p>
						)}
						<Button
							isDisabled={!!errorMessage}
							isLoading={isPending}
							type="submit"
							className="m-auto flex justify-center self-center mb-3 bg-btnColor text-white px-4 py-2 rounded-lg text-[13px] hover:bg-btnColorHover"
						>
							Update
						</Button>
					</form>
				</ModalBody>
			</ModalContent>
		</CustomModal>
	)
}

export default AddCollabModal
