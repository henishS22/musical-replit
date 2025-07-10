import { useForm } from "react-hook-form"
import { toast } from "react-toastify"

import { sendInvite } from "@/app/api/mutation"
import { TypeInviteEnum } from "@/constant/enum"
// import { useModalStore } from "@/stores"
import { collabDetails } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@nextui-org/react"
import { useMutation } from "@tanstack/react-query"
import { Mail } from "lucide-react"
import { z } from "zod"

import { useDynamicStore, useModalStore } from "@/stores"

// Define the validation schema using zod
const inviteSchema = z.object({
	email: z
		.string()
		.email("Please enter a valid email address")
		.min(1, "Email is required")
})

type InviteFormData = z.infer<typeof inviteSchema>

interface EmptyContentProps {
	searchText: string
	setSearchText: (text: string) => void
	setCollaborators: (collaborator: collabDetails) => void
}

interface InvitePayload {
	email: string
	type: string
	projectName: string
}

const EmptyContent: React.FC<EmptyContentProps> = ({
	searchText,
	setSearchText,
	setCollaborators
}) => {
	const { tempCustomModalData } = useModalStore()
	const { productTitle } = useDynamicStore()

	const {
		register,
		// handleSubmit,
		formState: { errors },
		reset,
		getValues
	} = useForm<InviteFormData>({
		resolver: zodResolver(inviteSchema),
		defaultValues: {
			email: searchText
		}
	})

	const { mutate: sendUserInvite, isPending: sendUserInviteLoading } =
		useMutation({
			mutationFn: (payload: InvitePayload) => sendInvite(payload),
			onSuccess: (data) => {
				if (data === "Invite sent successfully!") {
					const collaboratorDetails: collabDetails = {
						email: searchText,
						invitedForProject: true
					}
					setCollaborators(collaboratorDetails)
					toast.success(data)
					setSearchText("")
					reset()
				}
			}
		})

	const handleInvite = (): void => {
		const data = getValues()
		const parseResult = inviteSchema.safeParse(data)
		if (parseResult.success) {
			sendUserInvite({
				email: parseResult.data.email,
				type: TypeInviteEnum.Email,
				projectName: tempCustomModalData?.projectName || productTitle
			})
		}
	}

	return (
		<div className="flex flex-col items-center justify-center py-4 px-2 gap-3">
			<p className="text-sm text-gray-500 text-center">
				No matching user in platform.
			</p>
			<div className="flex items-center gap-2 text-sm text-gray-600">
				<Mail className="w-4 h-4" />
				<span>Invite by email:</span>
			</div>
			<div className="flex flex-col w-full gap-2">
				<div className="flex flex-col w-full">
					<input
						{...register("email")}
						type="email"
						placeholder="Enter email address"
						className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.email ? "border-red-500" : ""}`}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
							register("email").onChange(e)
							setSearchText(e.target.value)
						}}
					/>
					{errors.email && (
						<span className="text-xs text-red-500 mt-1">
							{errors.email.message}
						</span>
					)}
				</div>
				<Button
					onClick={handleInvite}
					color="primary"
					size="sm"
					className="w-full bg-btnColor hover:bg-btnColorHover"
					isLoading={sendUserInviteLoading}
				>
					Send Invitation
				</Button>
			</div>
		</div>
	)
}

export default EmptyContent
