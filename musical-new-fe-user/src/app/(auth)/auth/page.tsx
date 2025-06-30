import { Suspense } from "react"

import AuthForm from "@/components/auth/authForm"
import { Spinner } from "@nextui-org/react"

export const metadata = {
	title: "Auth",
	description: "Auth to your account"
}

export default function AuthPage() {
	return (
		<div>
			<Suspense fallback={<Spinner size="lg" />}>
				<AuthForm />
			</Suspense>
		</div>
	)
}
