"use client"

import React, { useState } from "react"

import { Eye, EyeOff } from "lucide-react"

interface CustomInputProps {
	label?: string
	type: string
	id?: string
	errorMessage: string
	isInvalid: boolean
	placeholder: string
	onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
	onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
	value?: string
	classname?: string
	mainClassname?: string // Optional prop for additional class names
	iconClassName?: string
}

const CustomPasswordInput = React.forwardRef<
	HTMLInputElement,
	CustomInputProps
>(
	(
		{
			label,
			type,
			id,
			value,
			errorMessage,
			isInvalid,
			placeholder,
			classname,
			onChange,
			onBlur,
			mainClassname,
			iconClassName,
			...rest
		},
		ref
	) => {
		const [showPassword, setShowPassword] = useState(false)

		const togglePasswordVisibility = () => {
			setShowPassword((prev) => !prev)
		}

		const isPasswordField = type === "password"

		return (
			<div className={`relative ${mainClassname}`}>
				{label && (
					<label className="block text-sm font-medium text-gray-700">
						{label}
					</label>
				)}
				<input
					id={id}
					type={isPasswordField && showPassword ? "text" : type}
					ref={ref}
					value={value}
					onChange={onChange}
					onBlur={onBlur}
					className={`block w-full px-4 py-2 mt-1 border rounded-md shadow-sm bg-white ${
						isInvalid ? "border-red-500" : "border-gray-300"
					} ${classname}`}
					placeholder={placeholder}
					{...rest}
				/>
				{isPasswordField && (
					<button
						type="button"
						onClick={togglePasswordVisibility}
						className={`absolute top-[34px] right-3 text-gray-500 h-5 w-5 ${
							iconClassName
						}`}
						aria-label={showPassword ? "Hide password" : "Show password"}
					>
						{showPassword ? (
							<EyeOff className="w-5 h-5" />
						) : (
							<Eye className="w-5 h-5" />
						)}
					</button>
				)}
				{isInvalid && (
					<p className="mt-1 text-sm text-red-500">{errorMessage}</p>
				)}
			</div>
		)
	}
)
CustomPasswordInput.displayName = "CustomPasswordInput"

export { CustomPasswordInput }
