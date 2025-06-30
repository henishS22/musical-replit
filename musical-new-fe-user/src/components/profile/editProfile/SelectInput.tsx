import { Select, SelectItem } from "@nextui-org/react"

const SelectInput = ({
	label,
	placeholder,
	options,
	className,
	onChange,
	value,
	classNames,
	...props
}: {
	label?: string
	placeholder: string
	options: { key: string; label: string }[]
	className?: string
	onChange: (value: string, option?: { key: string; label: string }) => void
	value?: string
	classNames?: {
		trigger: string
		listboxWrapper: string
		item: string
		itemDescription: string
		base?: string
		listbox?: string
	}
}) => {
	return (
		<Select
			key={label}
			className={`max-w-xs ${className}`}
			label={label}
			labelPlacement="outside"
			placeholder={placeholder}
			selectedKeys={value ? [value] : []} // ✅ Correct value binding
			onSelectionChange={(keys) => onChange(Array.from(keys)[0] as string)} // ✅ Fix selection
			aria-label="select-input"
			classNames={classNames}
			{...props}
		>
			{options.map((option) => (
				<SelectItem key={option.key} value={option.key}>
					{option.label}
				</SelectItem>
			))}
		</Select>
	)
}

export default SelectInput
