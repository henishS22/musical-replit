import { CustomInput } from "@/components/ui/customInput"
import { CustomDropdown } from "@/components/ui/dropdown/CustomDropdown"
import { DropdownConfig } from "@/types/breadcrumbTypes"

interface InputFieldProps {
	value: string
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
	label: string
	placeholder?: string
}

export const InputField = ({
	value,
	onChange,
	label,
	placeholder
}: InputFieldProps) => (
	<div className="space-y-2">
		<CustomInput
			type="text"
			placeholder={placeholder || `Enter ${label}`}
			value={value}
			onChange={onChange}
			classname="w-full !bg-white !border-2 !border-customGray !rounded-xl !p-3 !text-sm"
			label={label}
			labelClassName="text-inputLabel font-semibold text-[14px] leading-[24px] tracking-[-0.01em]"
		/>
	</div>
)

interface DropdownFieldProps {
	value: string
	onChange: (key: string) => void
	label: string
	options: { key: string; label: string }[]
}

export const DropdownField = ({
	value,
	onChange,
	label,
	options
}: DropdownFieldProps) => {
	const config: DropdownConfig = {
		activeLabel: value || `Select ${label}`,
		value,
		options,
		onChange,
		isStatic: false
	}

	return (
		<div className="space-y-2">
			<label className="text-inputLabel font-semibold text-[14px] leading-[24px] tracking-[-0.01em]">
				{label}
			</label>
			<CustomDropdown
				config={config}
				className="w-full !bg-white border-2 border-customGray rounded-xl !p-3 text-sm"
				triggerClassName="px-1 w-full !bg-white"
				optionsClassName="w-full md:min-w-[480px]"
			/>
		</div>
	)
}
