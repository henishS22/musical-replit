import React from "react"

import {
	Button,
	Checkbox,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger
} from "@nextui-org/react"

const MultiSelectDropdown: React.FC<{
	options: { key: string; label: string }[]
	selectedValues: string[]
	disable?: boolean
	onSelectionChange: (selected: string[]) => void
}> = ({ options, selectedValues, onSelectionChange, disable }) => {
	const [isOpen, setIsOpen] = React.useState(false)

	const selectedItems = React.useMemo(
		() =>
			options?.length &&
			options?.filter((option) => selectedValues.includes(option.key)),
		[options, selectedValues]
	)

	const toggleDropdown = () => setIsOpen((prev) => !prev)

	const handleSelection = (key: string) => {
		const updatedSelection = selectedValues.includes(key)
			? selectedValues.filter((item) => item !== key)
			: [...selectedValues, key]
		onSelectionChange(updatedSelection)
	}

	return (
		<div className="flex gap-1 flex-wrap">
			{selectedItems && selectedItems?.length > 0
				? selectedItems?.map((item) => {
						return (
							<div
								className="w-auto h-[24px] px-[6px] gap-[4px] rounded-[4px] bg-[rgba(255,216,141,1)] flex items-center text-xs text-ellipsis"
								key={item.label}
							>
								{item.label}
							</div>
						)
					})
				: null}
			<Dropdown
				isOpen={isOpen}
				onOpenChange={toggleDropdown}
				isDisabled={disable}
				className="max-w-[129px] w-full min-w-[130px] !p-0 !rounded-none"
			>
				<DropdownTrigger>
					<Button className="h-[24px] !rounded-none bg-transparent text-textGray p-0">
						Select Role
					</Button>
				</DropdownTrigger>
				<DropdownMenu
					aria-label="Multi-select dropdown"
					closeOnSelect={false}
					itemClasses={{
						base: [
							"transition-opacity",
							"data-[hover=true]:text-foreground",
							"data-[hover=true]:bg-default-100",
							"dark:data-[hover=true]:bg-default-50",
							"data-[selectable=true]:focus:bg-default-50",
							"data-[pressed=true]:opacity-70",
							"data-[focus-visible=true]:ring-default-500",
							"max-w-[130px] w-full px-0 pl-3"
						]
					}}
					className="radio-dropdown px-0 max-h-[400px] overflow-y-auto"
				>
					{options?.length > 0
						? options.map((option) => (
								<DropdownItem key={option.key} textValue={option.label}>
									<Checkbox
										isSelected={selectedValues.includes(option.key)}
										onChange={() => handleSelection(option.key)}
										color="success"
										size="sm"
									>
										<div className="font-normal text-xs">{option.label}</div>
									</Checkbox>
								</DropdownItem>
							))
						: null}
				</DropdownMenu>
			</Dropdown>
		</div>
	)
}

export default MultiSelectDropdown
