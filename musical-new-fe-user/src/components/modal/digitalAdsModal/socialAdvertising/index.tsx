import { updateModalStep } from "@/helpers/modalStepHelpers"

import { useDynamicStore } from "@/stores"

import GetStarted from "../common/GetStarted"
import CampaignSetup from "../SearchAdvertising/CampaignSetup"
import BudgetSetup from "./BudgetSetup"
import MetaCampaignSetup from "./MetaCampaignSetup"

const SearchAdvertising = () => {
	const { modalSteps } = useDynamicStore()

	const renderStep = () => {
		switch (modalSteps) {
			case 0:
				return (
					<GetStarted
						description="Put your music in front of targeted audiences online"
						onClick={() => updateModalStep(1)}
						title="Run Social Ads"
						secondaryButton={true}
					/>
				)
			case 1:
				return <CampaignSetup type="social" />
			case 2:
				return <MetaCampaignSetup />
			case 3:
				return <BudgetSetup />
			default:
				return (
					<GetStarted
						description="Put your music in front of targeted audiences online"
						onClick={() => updateModalStep(1)}
						title="Run Social Ads"
						secondaryButton={true}
					/>
				)
		}
	}

	return renderStep()
}

export default SearchAdvertising
