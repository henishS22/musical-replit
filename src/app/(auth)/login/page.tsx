import FormLogin from "@/components/auth/loginForm"

export const metadata = {
	title: "Login",
	description: "Login to your account"
}
export default function LoginPage() {
	return (
		<div className="login-form">
			<FormLogin />
		</div>
	)
}
