import { useEffect } from "react"
import { toast } from "react-toastify"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"

import { socialLogin, verifyGoogleLogin } from "@/app/api/mutation"
import { GOOGLE_ICON } from "@/assets"
import { Button } from "@nextui-org/react"
import { useMutation } from "@tanstack/react-query"
import Cookies from "js-cookie"

import {
	useAIChatStore,
	useDynamicStore,
	useLibraryStore,
	useUserStore
} from "@/stores"

interface GoogleAuthButtonProps {
	btnText?: string
}

const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
	btnText = "Sign In"
}) => {
	const searchParams = useSearchParams()
	const router = useRouter()
	const resetState = useDynamicStore((state) => state.resetState)
	const clearMessages = useAIChatStore((state) => state.clearMessages)
	const clearLibraryStore = useLibraryStore((state) => state.clearLibraryStore)
	const { loginData } = useUserStore()

	const { isPending: googleLogin, mutate: handleSocialLogin } = useMutation({
		mutationFn: socialLogin,
		onSuccess: (data) => {
			if (data) {
				window.location.replace(data)
			}
		},
		onError: (err: Error) => {
			toast.error(err.message)
		}
	})
	const { isPending: isGoogleVerifyLogin, mutate: verifyGoogleLoginMutation } =
		useMutation({
			mutationFn: (payload: Record<string, string>) =>
				verifyGoogleLogin(payload),
			onSuccess: (data) => {
				if (data) {
					Cookies.set("accessToken", data?.accessToken)
					const userData = { id: data?.userId }
					loginData(userData)
					resetState()
					clearMessages()
					clearLibraryStore()
					router.push("/dashboard")
				}
			},
			onError: (err: Error) => {
				toast.error(err.message)
			}
		})

	const handleGoogleLogin = () => {
		handleSocialLogin()
	}

	useEffect(() => {
		const code = searchParams.get("code") || ""
		// const redirect_uri =
		// 	`${process.env.NEXT_PUBLIC_DEVELOPMENT_URL}/login` || ""

		if (code) {
			verifyGoogleLoginMutation({
				code: code,
				platform: "web"
			})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams])

	return (
		<div>
			<Button
				className="flex gap-4 mx-auto mt-6 border-2 border-solid border-[#eeeeee] rounded-[10px] max-w-[346px] w-full py-[6px]"
				onPress={handleGoogleLogin}
				isLoading={googleLogin || isGoogleVerifyLogin}
			>
				<Image src={GOOGLE_ICON} alt="google" height={24} width={24} />
				{btnText} With Google
			</Button>
		</div>
	)
}

export default GoogleAuthButton
