import { FC } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"

import { resetPassword } from "@/app/api/mutation"
import { CustomInput } from "@/components/ui"
import { CONFIRMATION_MODAL, FORGET_PASSWORD_MODAL } from "@/constant/modalType"
import { Button, ModalBody, ModalFooter, ModalHeader } from "@nextui-org/react"
import { useMutation } from "@tanstack/react-query"

import { useModalStore } from "@/stores"

import CustomModal from "../CustomModal"

type ResetForm = {
	email: string
}

const ForgetPassword: FC = () => {
	const { hideCustomModal, customModalType, showCustomModal } = useModalStore()
	const router = useRouter()

	const {
		register,
		handleSubmit,
		formState: { errors }
	} = useForm<ResetForm>()

	const hideModal = () => {
		hideCustomModal()
		router.push("/login")
	}
	const { mutate, isPending } = useMutation({
		mutationFn: (data: ResetForm) => resetPassword(data, "POST"),
		onSuccess: (data) => {
			if (data) {
				showCustomModal({
					customModalType: CONFIRMATION_MODAL,
					tempCustomModalData: {
						title: "Confirmation",
						msg: "We sent you a recover link, please check your email!",
						hideFooter: true,
						messageStyle: "text-[18px] pb-6 content-center"
					}
				})
			}
		},
		onError: (error: Error) => {
			toast.error(error.message)
		}
	})

	const onSubmit = (data: ResetForm) => {
		const payload = {
			email: data.email
		}
		mutate(payload)
	}

	return (
		<CustomModal
			onClose={hideModal}
			showModal={customModalType === FORGET_PASSWORD_MODAL}
			size="lg"
		>
			<ModalHeader className="text-lg font-bold">Recover password</ModalHeader>
			<ModalBody>
				<p className="text-sm text-gray-500 mb-4">
					You will receive an email with a recovery link.
				</p>
				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="mb-4">
						<CustomInput
							label="Email"
							type="email"
							id="email"
							placeholder="you@example.com"
							errorMessage={errors?.email?.message || ""}
							isInvalid={!!errors?.email}
							{...register("email", {
								required: "Email is required",
								pattern: {
									value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
									message: "Invalid email format"
								}
							})}
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
							className="bg-blue-600 text-white"
							isLoading={isPending}
						>
							SEND EMAIL
						</Button>
					</ModalFooter>
				</form>
			</ModalBody>
		</CustomModal>
	)
}

export default ForgetPassword
