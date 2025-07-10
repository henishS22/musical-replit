import CreateOptionsList from "@/components/createOption/createOption"
import { useReleaseDropdown } from "@/helpers/dropdownOptions"
import { ProjectResponse } from "@/types/dashboarApiTypes"

import { releaseOptions } from "@/config"

interface ReleaseTabProps {
	tokenProject: ProjectResponse
}
const ReleaseTab: React.FC<ReleaseTabProps> = ({ tokenProject }) => {
	const { handleDropdownOption } = useReleaseDropdown()

	const handleOptionSelect = (
		option: { type: string; value: string; title: string; description: string },
		modalType: string
	) => {
		handleDropdownOption(option, modalType, tokenProject as ProjectResponse)
	}

	return (
		<div className="grid grid-cols-3 gap-6 p-6">
			<CreateOptionsList
				createOptions={releaseOptions}
				handleOptionSelect={handleOptionSelect}
			/>
		</div>
	)
}

export default ReleaseTab
