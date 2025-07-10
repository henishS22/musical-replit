import { FC } from "react"
import { Controller } from "react-hook-form"

import { Input } from "@nextui-org/react"

interface CustomTimePickerProps {
	name: string
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control: any
	errorMessage?: string
	isInvalid?: boolean
	placeholder?: string
}

export const CustomTimePicker: FC<CustomTimePickerProps> = ({
	name,
	control,
	errorMessage,
	isInvalid,
	placeholder = "Select time"
}) => {
	return (
		<Controller
			name={name}
			control={control}
			render={({ field }) => (
				<div>
					<div className="text-sm font-medium text-gray-700 mb-1">Time</div>
					<Input
						{...field}
						type="time"
						step="1800"
						placeholder={placeholder}
						errorMessage={errorMessage}
						isInvalid={isInvalid}
						classNames={{
							input: "text-gray-600",
							inputWrapper: "border-2"
						}}
					/>
				</div>
			)}
		/>
	)
}
