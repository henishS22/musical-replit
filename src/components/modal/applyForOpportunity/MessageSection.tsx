import React from "react"

import { Textarea } from "@nextui-org/react"

interface MessageSectionProps {
	message: string
	setMessage: (message: string) => void
}

const MessageSection: React.FC<MessageSectionProps> = ({
	message,
	setMessage
}) => {
	return (
		<div className="flex flex-col mt-4 w-full text-black max-md:max-w-full">
			<div className="flex flex-col w-full max-md:max-w-full">
				<div className="flex flex-col w-full max-md:max-w-full">
					<div className="text-sm font-bold tracking-tight max-md:max-w-full">
						Message <span className="text-noteRed">*</span>
					</div>
					<div className="mt-1 text-xs tracking-normal max-md:max-w-full">
						Reply to the brief. Share your relevant experience and what you hope
						to contribute to the collaboration.
					</div>
				</div>
				<div className="flex gap-3 mt-1 w-full ">
					<Textarea
						className="w-full h-full p-0 resize-none rounded-lg border-2 border-solid border-zinc-100 min-h-[100px]"
						aria-label="Reply to the brief"
						onValueChange={(e) => setMessage(e)}
						value={message}
						classNames={{
							innerWrapper: "p-2",
							input: "rounded-lg",
							inputWrapper: "rounded-lg p-0"
						}}
						minRows={4}
					/>
				</div>
			</div>
		</div>
	)
}

export default MessageSection
