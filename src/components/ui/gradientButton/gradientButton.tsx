"use client"

import { ReactNode } from "react"

import { Button, ButtonProps } from "@nextui-org/react"

interface GradientButtonProps extends ButtonProps {
	children: ReactNode
	className?: string
	borderWidth?: "thin" | "medium" | "thick"
}

const GradientButton = ({
	children,
	className = "",
	size = "md",
	...props
}: GradientButtonProps) => {
	const paddingSizes = {
		sm: "px-5 py-[6px]",
		md: "px-8 py-2",
		lg: "px-12 py-3"
	}

	return (
		<Button
			className={`relative rounded-lg p-[1px] ${className}`}
			size={size}
			{...props}
		>
			<div className="absolute inset-0 rounded-lg bg-gradient-to-b from-[#1DB854] to-[#0F5F2B]" />
			<div
				className={`relative rounded-[6px] bg-white transition-colors hover:bg-gray-50 m-[1px] ${paddingSizes[size]}`}
			>
				<span className="bg-gradient-to-b from-[#1DB653] to-[#0E5828] bg-clip-text text-transparent">
					{children}
				</span>
			</div>
		</Button>
	)
}

export default GradientButton
