"use client"

import { SubmitHandler, useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { useSearchParams } from "next/navigation"

import { createUser } from "@/app/api/mutation"
import { SIGNUP_BG } from "@/assets"
import { EMAIL_VERIFICATION_MODAL } from "@/constant/modalType"
import { SignupFormValues } from "@/types"
import { signupSchema } from "@/validationSchema/SignupSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Link } from "@nextui-org/react"
import { useMutation } from "@tanstack/react-query"

import { useModalStore } from "@/stores"

import EmailVerification from "../modal/signup/EmailVerification"
import { CustomInput, CustomPasswordInput } from "../ui"
import GoogleAuthButton from "../ui/googleAuthButton/googleAuthButton"
import LeftPanel from "./LeftPanel"

const SignUpForm = () => {
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset
	} = useForm<SignupFormValues>({
		resolver: zodResolver(signupSchema),
		mode: "onBlur"
	})

	const { showCustomModal } = useModalStore()
	const searchParams = useSearchParams()
	const inviteCode = searchParams.get("inviteCode")

	const { mutate, isPending } = useMutation({
		mutationFn: (val: Record<string, string | number | object>) =>
			createUser(val),
		onSuccess: (data) => {
			if (data && data.status !== "error") {
				showCustomModal({ customModalType: EMAIL_VERIFICATION_MODAL })
				reset()
			}
		},
		onError: (error: Error) => {
			toast.error(error.message)
		}
	})

	const onSubmit: SubmitHandler<SignupFormValues> = (data) => {
		const payload = {
			...data,
			email: data.email.toLowerCase(),
			...(inviteCode && { invitationCode: inviteCode }),
			genre: 2,
			profile_type: 1
		}
		mutate(payload)
	}

	return (
		<div className="flex w-full min-h-screen">
			<LeftPanel bannerBg={SIGNUP_BG} />
			<div className="flex-[65vw_1_1] text-[rgba(0,0,0,0.87)] flex items-center">
				<div className="max-w-[500px] w-full mx-auto">
					<p className="tracking-[0.00938em] text-[24px] font-medium font-montserrat text-center leading-[150%]">
						Sign up to get started
					</p>
					<GoogleAuthButton btnText="Sign Up" />
					{/* <Button
						className="flex gap-4 mx-auto mt-6 border-2 border-solid border-[#eeeeee] rounded-[10px] max-w-[346px] w-full py-[6px]"
						onPress={() => signIn("google")}
					>
						<Image src={GOOGLE_ICON} alt="google" height={24} width={24} />
						Sign Up With Google
					</Button> */}
					{/* <WalletAuth isSignup /> */}
					<>
						<div className="flex mt-6 w-full items-center gap-2 text-[#121212] whitespace-nowrap justify-center font-normal text-sm">
							<div className="flex-1 h-px border border-[rgba(0,0,0,0.12)]"></div>
							<span className="flex-shrink-0">OR</span>
							<div className="flex-1 h-px border border-[rgba(0,0,0,0.12)]"></div>
						</div>

						<div className="mt-10">
							<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
								<div>
									<CustomInput
										label="Artist"
										type="text"
										id="name"
										placeholder="Enter Artist name"
										errorMessage={errors?.name?.message || ""}
										isInvalid={!!errors?.name}
										{...register("name")}
									/>
								</div>

								<div>
									<CustomInput
										label="Username"
										type="text"
										id="username"
										placeholder="Enter your username"
										errorMessage={errors?.username?.message || ""}
										isInvalid={!!errors?.username}
										{...register("username")}
									/>
								</div>
								<div>
									<CustomInput
										label="Email"
										type="email"
										id="email"
										placeholder="you@example.com"
										errorMessage={errors?.email?.message || ""}
										isInvalid={!!errors?.email}
										{...register("email")}
									/>
								</div>
								<div className="flex gap-6">
									<div className="w-full">
										<CustomPasswordInput
											label="Password"
											type="password"
											id="password"
											placeholder="Password"
											errorMessage={errors?.password?.message || ""}
											isInvalid={!!errors?.password}
											{...register("password")}
										/>
									</div>
									<div className="w-full">
										<CustomPasswordInput
											label="Confirm Password"
											type="password"
											id="confirmPassword"
											placeholder="Confirm password"
											errorMessage={errors?.confirmPassword?.message || ""}
											isInvalid={!!errors?.confirmPassword}
											{...register("confirmPassword")}
										/>
									</div>
								</div>
								<Button
									type="submit"
									className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
									isLoading={isPending}
								>
									Sign Up
								</Button>
							</form>

							<div className="mt-6 text-center text-sm text-gray-600">
								By signing up, you agree to our{" "}
								<Link
									href={
										process.env.NEXT_PUBLIC_TERMS_URL ||
										"https://www.musicalapp.com/terms"
									}
									className="hover:text-blue-600 underline"
									target="_blank"
								>
									Terms of Service
								</Link>{" "}
								and{" "}
								<Link
									href={
										process.env.NEXT_PUBLIC_PRIVACY_URL ||
										"https://www.musicalapp.com/privacy"
									}
									className="hover:text-blue-600 underline"
									target="_blank"
								>
									Privacy Policy
								</Link>
								.
							</div>

							<div className="mt-4 text-center text-sm text-gray-600">
								Already have an account?{" "}
								<Link href="/login" className="hover:text-blue-600 underline">
									Log in
								</Link>
							</div>
						</div>
					</>
				</div>
			</div>
			<EmailVerification />
		</div>
	)
}

export default SignUpForm
