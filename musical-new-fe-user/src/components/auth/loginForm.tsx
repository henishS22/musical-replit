"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { login, validateToken } from "@/app/api/mutation"
import { AUTH_BG } from "@/assets"
import { CustomInput, CustomPasswordInput } from "@/components/ui"
import { FORGET_PASSWORD_MODAL } from "@/constant/modalType"
import { ACCOUNT_VERIFIED_SUCCESSFULLY } from "@/constant/toastMessages"
import { LoginForm, loginUsingCreds } from "@/types"
import loginSchema from "@/validationSchema/LoginSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@nextui-org/react"
import { useMutation } from "@tanstack/react-query"
import Cookies from "js-cookie"

import {
	useAIChatStore,
	useDynamicStore,
	useLibraryStore,
	useModalStore,
	useUserStore
} from "@/stores"

import ForgetPassword from "../modal/forgetPassword/ForgetPassword"
import GoogleAuthButton from "../ui/googleAuthButton/googleAuthButton"
import LeftPanel from "./LeftPanel"

export default function FormLogin() {
	const router = useRouter()
	const resetState = useDynamicStore((state) => state.resetState)
	const clearMessages = useAIChatStore((state) => state.clearMessages)
	const clearLibraryStore = useLibraryStore((state) => state.clearLibraryStore)
	const { showCustomModal } = useModalStore()

	const { loginData } = useUserStore()

	const {
		register,
		handleSubmit,
		formState: { errors }
	} = useForm<LoginForm>({
		resolver: zodResolver(loginSchema),
		mode: "onBlur"
	})

	const { mutate } = useMutation({
		mutationFn: (val: string) => validateToken(val),
		onSuccess: (data) => {
			if (data) {
				toast.success(ACCOUNT_VERIFIED_SUCCESSFULLY)
			}
		},
		onError: (error: Error) => {
			toast.error(error.message)
		}
	})

	const { mutate: loginMutation, isPending } = useMutation({
		mutationFn: (payload: loginUsingCreds) => login(payload),
		onSuccess: (data) => {
			if (data) {
				if (data?.jwt) Cookies.set("accessToken", data.jwt)
				const userData = { ...data }
				delete userData.jwt
				loginData(userData)
				resetState()
				clearMessages()
				clearLibraryStore()
				router.push("/dashboard")
			}
		},
		onError: (error: Error) => {
			toast.error(error.message)
		}
	})

	const onSubmit = async (data: LoginForm): Promise<void> => {
		// Destructure data for readability
		const { email, password } = data
		const payload: loginUsingCreds = {
			email,
			pass: password,
			withJwt: true
		}
		loginMutation(payload)
	}

	const handleForget = () => {
		showCustomModal({ customModalType: FORGET_PASSWORD_MODAL })
	}

	useEffect(() => {
		if (typeof window !== "undefined") {
			const urlParams = new URLSearchParams(window.location.search)
			const token = urlParams.get("token")
			if (token) {
				mutate(token)
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<div className="flex w-full min-h-screen">
			<LeftPanel bannerBg={AUTH_BG} />
			<div className="flex-[65vw_1_1] text-[rgba(0,0,0,0.87)] flex items-center">
				<div className="max-w-[346px] w-full mx-auto">
					<p className="m-0 tracking-[0.00938em] text-2xl font-medium font-montserrat text-center leading-[150%]">
						Welcome back
					</p>
					<p className="m-0 font-normal tracking-[0.00938em] text-sm font-montserrat text-center leading-[150%]">
						Enter your email and password to log in
					</p>
					<GoogleAuthButton />
					{/* <WalletAuth /> */}
					<div className="flex mt-6 w-full items-center gap-2 text-[#121212] whitespace-nowrap justify-center font-normal text-sm">
						<div className="flex-1 h-px border border-[rgba(0,0,0,0.12)]"></div>
						<span className="flex-shrink-0">OR</span>
						<div className="flex-1 h-px border border-[rgba(0,0,0,0.12)]"></div>
					</div>

					<form
						onSubmit={handleSubmit(onSubmit)}
						className="space-y-4 max-w-md mx-auto mt-5"
					>
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

						<div>
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

						<Button
							type="submit"
							className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
							isLoading={isPending}
						>
							LOGIN
						</Button>

						<div className="text-center">
							<Link
								href="/signup"
								className="text-sm hover:text-blue-600 hover:underline"
							>
								Create a new account
							</Link>
							<br />
							<div
								onClickCapture={handleForget}
								className="text-sm hover:text-blue-600 hover:underline cursor-pointer"
							>
								Lost your password?
							</div>
						</div>
					</form>
				</div>
			</div>
			<ForgetPassword />
		</div>
	)
}
