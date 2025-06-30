import React from "react"

import { Textarea } from "@nextui-org/react"

interface MessageInputProps {
	value: string
	onChange: (value: string) => void
	maxLength?: number
}
export const MessageInput: React.FC<MessageInputProps> = ({
	value,
	onChange,
	maxLength = 800
}) => {
	return (
		<div className="relative w-full">
			<Textarea
				value={value}
				onValueChange={onChange}
				placeholder="Type your message..."
				className="min-h-[102px] w-full font-medium"
			/>
			<div className="absolute bottom-[30px] right-3 text-sm font-medium">
				{value.length}/{maxLength}
			</div>
		</div>
	)
}
