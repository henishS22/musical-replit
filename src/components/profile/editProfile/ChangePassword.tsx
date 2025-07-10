"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"

import { updateUser } from "@/app/api/mutation"
import { CustomPasswordInput } from "@/components/ui/customPasswordInput"
import { TitleBadgeCard } from "@/components/ui/titleBadgeCard"
import CustomTooltip from "@/components/ui/tooltip"
import { Button } from "@nextui-org/react"
import { useMutation } from "@tanstack/react-query"

import { useUserStore } from "@/stores"

type ChangePasswordForm = {
	oldPassword: string
	newPassword: string
	confirmPassword: string
}

const ChangePassword = () => {
	const {
		register,
		handleSubmit,
		watch,
		reset,
		formState: { errors, isSubmitting }
	} = useForm<ChangePasswordForm>()

	const { userData } = useUserStore()
	const { mutate: updatePassword, isPending } = useMutation({
		mutationFn: async (data: {
			oldPassword: string
			newPassword: string
			username: string
		}) => {
			return updateUser(data)
		},
		onError: (error: Error) => {
			toast.error(error.message)
		},
		onSuccess: (data) => {
			if (data) {
				toast.success("Password updated successfully!")
				reset() // Clear input fields on success
			}
		}
	})

	const onSubmit = (data: ChangePasswordForm) => {
		updatePassword({
			oldPassword: data.oldPassword,
			newPassword: data.newPassword,
			username: userData?.username as string
		})
	}

	return (
		<section className="max-w-[740px]">
			<TitleBadgeCard
				markColor="#CABDFF"
				title="Change Password"
				titleClassName="!mb-0"
			>
				<form
					onSubmit={handleSubmit(onSubmit)}
					className="flex flex-col mt-12 w-full"
				>
					{/* Old Password */}
					<div className="w-full">
						<label className="flex gap-1 items-center text-sm font-semibold text-neutral-700">
							Old password
							<CustomTooltip tooltipContent="Enter your old Password" />
						</label>
						<CustomPasswordInput
							type="password"
							{...register("oldPassword", {
								required: "Old password is required"
							})}
							placeholder="Enter your old password"
							isInvalid={!!errors.oldPassword}
							errorMessage={errors.oldPassword?.message || ""}
							iconClassName="!top-[15px]"
						/>
					</div>

					{/* New & Confirm Password */}
					<div className="flex flex-wrap gap-4 mt-8 w-full">
						{/* New Password */}
						<div className="flex-1 min-w-60">
							<label className="flex gap-1 items-center text-sm font-semibold text-neutral-700">
								New password
								<CustomTooltip tooltipContent="Password must contain 1 uppercase, 1 special character, and 1 number" />
							</label>
							<CustomPasswordInput
								type="password"
								{...register("newPassword", {
									required: "New password is required",
									minLength: {
										value: 8,
										message: "Password must be at least 8 characters"
									},
									pattern: {
										value: /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*\d).{8,}$/,
										message:
											"Password must contain 1 uppercase, 1 special character, and 1 number"
									},
									validate: (value) =>
										value !== watch("oldPassword") ||
										"New password cannot be the same as old password"
								})}
								placeholder="Enter your new password"
								isInvalid={!!errors.newPassword}
								errorMessage={errors.newPassword?.message || ""}
								iconClassName="!top-[15px]"
							/>
						</div>

						{/* Confirm Password */}
						<div className="flex-1 min-w-60">
							<label className="flex gap-1 items-center text-sm font-semibold text-neutral-700">
								Confirm new password
								<CustomTooltip tooltipContent="Please confirm your password" />
							</label>
							<CustomPasswordInput
								type="password"
								{...register("confirmPassword", {
									required: "Please confirm your new password",
									validate: (value) =>
										value === watch("newPassword") || "Passwords do not match"
								})}
								placeholder="Confirm your new password"
								isInvalid={!!errors.confirmPassword}
								errorMessage={errors.confirmPassword?.message || ""}
								iconClassName="!top-[15px]"
							/>
						</div>
					</div>

					{/* Submit Button */}
					<Button
						isLoading={isSubmitting || isPending}
						type="submit"
						className="self-start px-5 py-3 mt-8 text-base font-bold rounded-xl text-white bg-btnColor"
					>
						Update password
					</Button>
				</form>
			</TitleBadgeCard>
		</section>
	)
}

export default ChangePassword
