import { useRef } from "react"
import { Controller, useFormContext } from "react-hook-form"

const OTP_LENGTH = 6

type OtpInputProps = {
	onComplete: (otp: string) => void
	disabled: boolean
}

const OtpInput = ({ onComplete, disabled }: OtpInputProps) => {
	const { control, setValue, getValues } = useFormContext()
	const inputRefs = useRef<(HTMLInputElement | null)[]>([])

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		index: number
	) => {
		const val = e.target.value.replace(/\D/g, "") // Digits only

		if (val.length === 1) {
			setValue(`otp.${index}`, val) // update form
			if (index < OTP_LENGTH - 1) {
				inputRefs.current[index + 1]?.focus()
			}
		} else if (val.length > 1) {
			// If someone pastes multiple characters, take only the first
			setValue(`otp.${index}`, val[0])
		}

		// Check if all fields are filled
		const currentOtp = getValues("otp")
		const fullOtp = Object.values({ ...currentOtp, [index]: val[0] })
			.join("")
			.trim()

		if (fullOtp.length === OTP_LENGTH) {
			onComplete(fullOtp)
		}
	}

	const handleKeyDown = (
		e: React.KeyboardEvent<HTMLInputElement>,
		index: number
	) => {
		const currentValue = getValues(`otp.${index}`)

		if (e.key === "Backspace") {
			if (currentValue) {
				// Clear current input
				setValue(`otp.${index}`, "")
			} else if (index > 0) {
				// Move to previous input
				inputRefs.current[index - 1]?.focus()
				setValue(`otp.${index - 1}`, "")
			}
		}
	}

	return (
		<div className="flex justify-center gap-2">
			{[...Array(OTP_LENGTH)].map((_, i) => (
				<Controller
					key={i}
					disabled={disabled}
					name={`otp.${i}`}
					control={control}
					defaultValue=""
					render={({ field: { value, ...rest } }) => (
						<input
							{...rest}
							ref={(el) => {
								inputRefs.current[i] = el
							}}
							value={value}
							maxLength={1}
							inputMode="numeric"
							pattern="\d*"
							className="w-12 h-12 text-center border rounded-md text-xl"
							onChange={(e) => {
								handleChange(e, i)
							}}
							onKeyDown={(e) => handleKeyDown(e, i)}
						/>
					)}
				/>
			))}
		</div>
	)
}

export default OtpInput
