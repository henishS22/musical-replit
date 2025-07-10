"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"

import { resetPassword } from "@/app/api/mutation"
import { AUTH_BG } from "@/assets"
import { PASSWORD_RESET_SUCCESSFULLY } from "@/constant/toastMessages"
import { resetPasswordSchema } from "@/validationSchema/SignupSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Spacer } from "@nextui-org/react"
import { useMutation } from "@tanstack/react-query"

import { CustomPasswordInput } from "../ui"
import LeftPanel from "./LeftPanel"

interface ResetPasswordForm {
	password: string
	confirmPassword: string
}

const ResetPassword: React.FC = () => {
	const {
		register,
		handleSubmit,
		formState: { errors }
	} = useForm<ResetPasswordForm>({
		resolver: zodResolver(resetPasswordSchema),
		mode: "onBlur"
	})

	const router = useRouter()

	const { mutate, isPending } = useMutation({
		mutationFn: (data: Record<string, string>) => resetPassword(data, "PATCH"),
		onSuccess: (data) => {
			if (data) {
				toast.success(PASSWORD_RESET_SUCCESSFULLY)
				router.push("/login")
			}
		},
		onError: (error: Error) => {
			toast.error(error.message)
		}
	})

	const onSubmit = (data: ResetPasswordForm) => {
		const urlParams = new URLSearchParams(window.location.search)
		const token = urlParams.get("token") || ""

		const payload = {
			password: data.password,
			token: token
		}
		mutate(payload)
	}

	return (
		<div className="flex w-full min-h-screen">
			<LeftPanel bannerBg={AUTH_BG} />
			<div className="flex-[65vw_1_1] text-[rgba(0,0,0,0.87)] flex items-center">
				<div className="w-full max-w-[350px] mx-auto">
					<div className="text-[24px] text-center mb-4">Reset Password</div>
					<form onSubmit={handleSubmit(onSubmit)}>
						<CustomPasswordInput
							label="New Password"
							type="password"
							id="password"
							placeholder="Password"
							errorMessage={errors?.password?.message || ""}
							isInvalid={!!errors?.password}
							{...register("password")}
						/>

						<CustomPasswordInput
							label="Confirm New Password"
							type="password"
							id="confirmPassword"
							placeholder="Confirm Password"
							errorMessage={errors?.confirmPassword?.message || ""}
							isInvalid={!!errors?.confirmPassword}
							{...register("confirmPassword")}
							mainClassname="mt-4"
						/>

						<Spacer y={1} />

						{/* Submit Button */}
						<Button
							type="submit"
							color="primary"
							isLoading={isPending}
							className="mt-4 w-full text-white bg-blue-600"
						>
							Reset Password
						</Button>
					</form>
				</div>
			</div>
		</div>
	)
}

export default ResetPassword
