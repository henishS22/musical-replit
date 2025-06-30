import React from "react"

import CustomTooltip from "../tooltip"

interface CustomTextareaProps {
	label?: string
	id?: string
	name?: string
	errorMessage?: string
	isInvalid?: boolean
	placeholder?: string
	onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
	onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void
	value?: string
	classname?: string
	showTooltip?: boolean
	tooltipText?: string
	labelClassName?: string
	readOnly?: boolean
	onClick?: () => void
	wrapperClassName?: string
	mainWrapperClassName?: string
	onKeyPress?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void
	disabled?: boolean
	rows?: number
}

const CustomTextarea = React.forwardRef<
	HTMLTextAreaElement,
	CustomTextareaProps
>(
	(
		{
			label,
			id,
			value,
			name,
			errorMessage,
			isInvalid,
			placeholder,
			classname,
			onChange,
			onBlur,
			showTooltip = false,
			tooltipText,
			labelClassName,
			readOnly,
			onClick,
			wrapperClassName,
			mainWrapperClassName = "",
			onKeyPress,
			disabled,
			rows = 4,
			...rest
		},
		ref
	) => {
		return (
			<div className={`${mainWrapperClassName} w-full`}>
				{label && (
					<label
						className={`${!labelClassName ? "flex gap-2 text-sm font-medium text-gray-700" : labelClassName}`}
					>
						{label}
						{showTooltip && (
							<CustomTooltip tooltipContent={tooltipText || ""} />
						)}
					</label>
				)}
				<div className={`relative flex items-center ${wrapperClassName}`}>
					<textarea
						id={id}
						name={name}
						ref={ref}
						value={value}
						onChange={onChange}
						onBlur={onBlur}
						rows={rows}
						className={`${classname} block w-full px-4 py-2 mt-1 border rounded-md shadow-sm bg-white ${
							isInvalid ? "border-red-500" : "border-gray-300"
						} resize-y`}
						placeholder={placeholder}
						{...rest}
						readOnly={readOnly}
						onClick={onClick}
						onKeyDown={onKeyPress}
						disabled={disabled}
					/>
				</div>
				{isInvalid && (
					<p className="mt-1 text-sm text-red-500">{errorMessage}</p>
				)}
			</div>
		)
	}
)
CustomTextarea.displayName = "CustomTextarea"

export { CustomTextarea }
