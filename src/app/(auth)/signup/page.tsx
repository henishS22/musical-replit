import SignUpForm from "@/components/auth/singUpForm"

export const metadata = {
	title: "SignUp",
	description: "SignUp to your account"
}
export default function SignUpPage() {
	return (
		<div className="login-form">
			<SignUpForm />
		</div>
	)
}
