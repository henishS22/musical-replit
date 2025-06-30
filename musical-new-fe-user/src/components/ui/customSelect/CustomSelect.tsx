import React from "react"
import Select, {
	ActionMeta,
	MultiValue,
	Options,
	SingleValue
} from "react-select"

interface CustomSelectProps {
	options: Options<{ value: string; label: string }> // Options for the dropdown
	isMulti?: boolean // Allow multiple selection
	placeholder?: string // Placeholder text
	value:
		| MultiValue<{ value: string; label: string }>
		| SingleValue<{ value: string; label: string }> // Selected value
	onChange: (
		value:
			| MultiValue<{ value: string; label: string }>
			| SingleValue<{ value: string; label: string }>,
		actionMeta: ActionMeta<{ value: string; label: string }>
	) => void // Change handler
	maxTags?: number // Optional max tags restriction
	isLoading?: boolean
}

const CustomSelect: React.FC<CustomSelectProps> = ({
	options,
	isMulti = false,
	placeholder = "Select...",
	value,
	isLoading,
	onChange,
	maxTags
}) => {
	const handleChange = (
		selected:
			| MultiValue<{ value: string; label: string }>
			| SingleValue<{ value: string; label: string }>,
		actionMeta: ActionMeta<{ value: string; label: string }>
	) => {
		if (
			isMulti &&
			maxTags &&
			Array.isArray(selected) &&
			selected.length > maxTags
		) {
			return // Prevent adding more than max tags
		}
		onChange(selected, actionMeta)
	}

	return (
		<Select
			isLoading={isLoading}
			options={options}
			isMulti={isMulti}
			placeholder={placeholder}
			value={value}
			onChange={handleChange}
			className="text-sm"
			classNamePrefix="react-select"
			theme={(theme) => ({
				...theme,
				colors: {
					...theme.colors,
					primary25: "#d1fae5", // Light green for hover
					primary: "#1DB954" // Green for focus
				}
			})}
			styles={{
				multiValue: (styles) => ({
					...styles,
					backgroundColor: "#1DB954" // Green background for selected items
				}),
				multiValueLabel: (styles) => ({
					...styles,
					color: "white" // White text for selected items
				}),
				multiValueRemove: (styles) => ({
					...styles,
					color: "white", // White remove button
					":hover": {
						color: "white"
					}
				})
			}}
		/>
	)
}

export default CustomSelect
