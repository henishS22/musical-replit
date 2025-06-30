import { useEffect } from "react"

import { CountryCode } from "@/types/inviteTypes"

import { useDynamicStore } from "@/stores"

import Select from "./dropdown/SelectDropdown"

interface CountryCodeDropdownProps {
	countryCodes: CountryCode[]
	isLoading: boolean
}

const defaultCountry = {
	code: "US",
	dial_code: "+1",
	name: "United States"
}

const CountryCodeDropdown = ({
	countryCodes,
	isLoading
}: CountryCodeDropdownProps) => {
	const { addState, updateState, selectedCountry } = useDynamicStore()

	const handleSelectionChange = (value: string) => {
		const selected = countryCodes.find((country) => country?.name === value)
		if (selected) {
			updateState("selectedCountry", selected)
		}
	}

	useEffect(() => {
		addState("selectedCountry", defaultCountry)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<Select<CountryCode>
			items={countryCodes}
			isLoading={isLoading}
			className="w-[120px]"
			onSelectionChange={handleSelectionChange}
			getItemValue={(country: CountryCode) => country.name}
			selectedValue={selectedCountry || defaultCountry}
			defaultSelectedKeys={[defaultCountry.name]}
			renderValue={(country: CountryCode | null) => (
				<div className="flex items-center gap-2">
					<span className="font-medium text-nowrap">{country?.dial_code}</span>
				</div>
			)}
			renderItem={(country: CountryCode) => (
				<div className="flex items-center gap-2">
					<span className="font-medium text-nowrap">{country?.dial_code}</span>
					<span className="text-sm text-gray-600 text-nowrap">
						{country?.name}
					</span>
				</div>
			)}
			placeholder="Country Code"
		/>
	)
}

export default CountryCodeDropdown
