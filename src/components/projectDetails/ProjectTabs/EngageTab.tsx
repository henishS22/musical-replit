import CreateOptionsList from "@/components/createOption/createOption"
import { useEngageDropdown } from "@/helpers/dropdownOptions"

import { engageOptions } from "@/config"

const EngageTab: React.FC = () => {
	const { handleDropdownOption } = useEngageDropdown()

	const handleOptionSelect = (
		option: { type: string; value: string; title: string; description: string },
		modalType: string
	) => {
		handleDropdownOption(option, modalType)
	}

	return (
		<div className="grid grid-cols-3 gap-6 p-6">
			<CreateOptionsList
				createOptions={engageOptions}
				handleOptionSelect={handleOptionSelect}
			/>
		</div>
	)
}

export default EngageTab
