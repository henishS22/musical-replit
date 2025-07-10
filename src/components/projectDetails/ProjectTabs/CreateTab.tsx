import { useState } from "react"

import CreateOptionsList from "@/components/createOption/createOption"
import { StartSoloModal } from "@/components/dashboard/create-module/startsolo-modal"
import WorkWithAiModal from "@/components/modal/WorkWithAiModal"
import { useCreateDropdown } from "@/helpers/dropdownOptions"

import { createOptions } from "@/config"
import { useModalStore } from "@/stores"

const CreateTab: React.FC = () => {
	const { hideCustomModal } = useModalStore()
	const [selectedValue, setSelectedValue] = useState<string>("")
	const { handleDropdownOption } = useCreateDropdown()
	const handleOptionSelect = (
		option: { type: string; value: string; title: string; description: string },
		modalType: string
	) => {
		handleDropdownOption(option, modalType, setSelectedValue)
	}

	return (
		<div className="grid grid-cols-3 gap-6 p-6">
			<CreateOptionsList
				createOptions={createOptions}
				handleOptionSelect={handleOptionSelect}
			/>
			<StartSoloModal
				onBack={() => hideCustomModal()}
				initialKey={selectedValue}
			/>

			<WorkWithAiModal initialKey={selectedValue} />
		</div>
	)
}

export default CreateTab
