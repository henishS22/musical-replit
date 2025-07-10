import React from "react"

interface TextAreaProps
	extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	label: string
	error?: string
}
export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
	({ label, error, ...props }, ref) => {
		return (
			<div className="flex flex-col gap-1 items-start w-full">
				<label className="w-full text-sm font-bold tracking-tight leading-5 text-[#33383F]">
					{label}
				</label>
				<textarea
					ref={ref}
					className={`w-full p-3 rounded-lg border-2 resize-none ${
						error ? "border-red-500" : "border-hoverGray"
					}`}
					{...props}
				/>
				{error && <span className="text-red-500 text-sm">{error}</span>}
			</div>
		)
	}
)

TextArea.displayName = "TextArea"
