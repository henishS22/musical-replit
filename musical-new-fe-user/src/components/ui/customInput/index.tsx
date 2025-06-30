import React from "react"

import CustomTooltip from "../tooltip"

interface CustomInputProps {
	label?: string
	type: string
	id?: string
	name?: string
	errorMessage?: string
	isInvalid?: boolean
	placeholder?: string
	onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
	onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
	value?: string
	classname?: string // Optional prop for additional class names
	showTooltip?: boolean
	tooltipText?: string
	endContent?: React.ReactNode
	rounded?: string
	startContent?: React.ReactNode
	labelClassName?: string
	readOnly?: boolean
	onClick?: () => void
	wrapperClassName?: string
	countryCode?: React.ReactNode
	endContentClassName?: string
	mainWrapperClassName?: string
	onKeyPress?: (event: React.KeyboardEvent<HTMLInputElement>) => void
	disabled?: boolean
	labelPart?: string
	labelPartClassName?: string
	onLabelPartClick?: () => void
}

const CustomInput = React.forwardRef<HTMLInputElement, CustomInputProps>(
	(
		{
			label,
			type,
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
			endContent,
			rounded,
			startContent,
			labelClassName,
			readOnly,
			onClick,
			wrapperClassName,
			countryCode,
			endContentClassName,
			mainWrapperClassName = "",
			onKeyPress,
			disabled,
			labelPart,
			labelPartClassName,
			onLabelPartClick,
			...rest
		},
		ref
	) => {
		return (
			<div className={`${mainWrapperClassName} w-full`}>
				{label && (
					<label
						className={`${!labelClassName ? "flex justify-between items-center text-sm font-medium text-[#33383F]" : labelClassName}`}
					>
						<span className="flex gap-2">
							{label}
							{showTooltip && (
								<CustomTooltip tooltipContent={tooltipText || ""} />
							)}
						</span>
						{labelPart && (
							<span
								onClick={onLabelPartClick}
								className={`${!labelPartClassName ? "text-red-500" : labelPartClassName}`}
							>
								{labelPart}
							</span>
						)}
					</label>
				)}
				<div className={`relative flex items-center ${wrapperClassName}`}>
					{countryCode && <div className="w-[25%]">{countryCode}</div>}

					{startContent && (
						<div className="absolute left-3 top-[17px] pointer-events-none">
							{startContent}
						</div>
					)}

					<input
						id={id}
						type={type}
						name={name}
						ref={ref}
						value={value}
						onChange={onChange}
						onBlur={onBlur}
						className={`${classname} block w-full ${startContent ? "pl-9" : "px-4"} py-2 mt-1 border ${!rounded ? "rounded-md" : rounded} shadow-sm bg-white ${
							isInvalid ? "border-red-500" : "border-gray-300"
						} `}
						placeholder={placeholder}
						{...rest}
						readOnly={readOnly}
						onClick={onClick}
						onKeyDown={onKeyPress}
						disabled={disabled}
					/>
					{endContent && (
						<div
							className={`absolute right-3 top-[18px] ${endContentClassName}`}
						>
							{endContent}
						</div>
					)}
				</div>
				{isInvalid && (
					<p className="mt-1 text-sm text-red-500">{errorMessage}</p>
				)}
			</div>
		)
	}
)
CustomInput.displayName = "CustomInput"

export { CustomInput }
