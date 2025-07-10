import * as React from "react"
import { memo } from "react"

import { Collaborator, SearchBarProps } from "@/types"
import { ProjectDataType } from "@/types/dashboarApiTypes"
import { CountryCode } from "@/types/inviteTypes"
import { Autocomplete, AutocompleteItem } from "@nextui-org/react"
import { Search } from "lucide-react"

export default memo(function CustomSearchbar({
	onSearch = () => {},
	onSelect = () => {},
	options = [],
	listboxProps = {},
	placeholder = "Search...",
	startContent = (
		<Search
			className="object-contain shrink-0 self-stretch my-auto w-4 aspect-square"
			aria-hidden="true"
		/>
	),
	isLoading = false,
	children,
	popoverProps = {},
	inputProps = {},
	classNames = {},
	isVirtualized = true,
	radius = "md",
	variant = "flat",
	header = false,
	maxWidth = false,
	emptyContent = "No matching collaborators. Type a valid email to invite"
}: SearchBarProps) {
	const [value, setValue] = React.useState<string>("")

	return (
		<Autocomplete
			isVirtualized={isVirtualized}
			isLoading={isLoading}
			aria-label="Select"
			className={`flex gap-3 items-center w-full text-gray-500 bg-white rounded-lg border-solid ${!maxWidth ? "max-w-xs" : ""}`}
			classNames={classNames}
			inputValue={value}
			onInputChange={(newValue) => {
				setValue(newValue || "") // Handle potential null/undefined values
				onSearch(newValue || "") // Ensure a valid string is passed
			}}
			startContent={startContent}
			placeholder={placeholder}
			items={options as Iterable<Collaborator | ProjectDataType | CountryCode>} // Ensure options is an array
			onSelectionChange={(key) => {
				const selected = options?.find(
					(c) =>
						((c as Collaborator | ProjectDataType)?._id ||
							(c as CountryCode)?.code) === key
				)
				if (selected) {
					onSelect(selected)
				}
			}}
			listboxProps={{
				className: `m-0 w-full min-h-[34px] ${!header ? "bg-[#F4F4F4]" : ""} 
					 text-[#777777] ${!header ? "text-xs" : "text-sm"} font-normal`,
				emptyContent: emptyContent,
				...listboxProps
			}}
			popoverProps={{ ...popoverProps }}
			inputProps={inputProps}
			radius={radius}
			variant={variant}
		>
			{(item) =>
				children ? (
					children(item)
				) : (
					<AutocompleteItem
						key={
							(item as Collaborator | ProjectDataType)?._id ||
							(item as CountryCode)?.code
						}
						id={
							(item as Collaborator | ProjectDataType)?._id ||
							(item as CountryCode)?.code
						}
					>
						{(item as Collaborator | ProjectDataType)?.name ||
							(item as CountryCode)?.name}
					</AutocompleteItem>
				)
			}
		</Autocomplete>
	)
})
