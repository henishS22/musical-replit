import { Select as NextUISelect, SelectItem } from "@nextui-org/react"

interface SelectProps<T extends object> {
	items: T[]
	isLoading?: boolean
	className?: string
	onSelectionChange?: (value: string) => void
	renderValue?: (selected: T | null) => React.ReactNode
	renderItem?: (item: T) => React.ReactNode
	getItemValue: (item: T) => string
	selectedValue?: T | null
	placeholder?: string
	defaultSelectedKeys?: string[]
}

const Select = <T extends object>({
	items,
	isLoading,
	className = "",
	onSelectionChange,
	renderValue,
	renderItem,
	getItemValue,
	selectedValue,
	placeholder,
	defaultSelectedKeys
}: SelectProps<T>) => {
	return (
		<NextUISelect
			aria-label={placeholder}
			className={className}
			onSelectionChange={(keys) => {
				const selected = Array.from(keys)[0] as string
				onSelectionChange?.(selected)
			}}
			isLoading={isLoading}
			items={items}
			classNames={{
				trigger: "h-[48px] rounded-[16px]",
				value: "text-base text-[#fff] text-nowrap"
			}}
			defaultSelectedKeys={defaultSelectedKeys}
			renderValue={
				renderValue && selectedValue
					? () => renderValue(selectedValue)
					: undefined
			}
			size="md"
			placeholder={placeholder}
		>
			{(item) => (
				<SelectItem
					key={getItemValue(item)}
					value={getItemValue(item)}
					textValue={getItemValue(item)}
				>
					{renderItem?.(item)}
				</SelectItem>
			)}
		</NextUISelect>
	)
}

export default Select
