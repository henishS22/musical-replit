import CreateOptionsList from "@/components/createOption/createOption"
import { usePromoteDropdown } from "@/helpers/dropdownOptions"

import { promoteOptions } from "@/config"

const PromoteTab: React.FC = () => {
	const { handleDropdownOption } = usePromoteDropdown()

	const handleOptionSelect = (
		option: { type: string; value: string; title: string; description: string },
		modalType: string
	) => {
		handleDropdownOption(option, modalType)
	}

	return (
		<div className="grid grid-cols-3 gap-6 p-6">
			<CreateOptionsList
				createOptions={promoteOptions}
				handleOptionSelect={handleOptionSelect}
			/>
		</div>
	)
}

export default PromoteTab
