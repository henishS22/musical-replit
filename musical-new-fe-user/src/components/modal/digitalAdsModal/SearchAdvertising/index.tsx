import { updateModalStep } from "@/helpers/modalStepHelpers"

import { useDynamicStore } from "@/stores"

import GetStarted from "../common/GetStarted"
import CampaignSetup from "./CampaignSetup"
import KeywordSelection from "./KeywordSelection"

const SearchAdvertising = () => {
	const { modalSteps } = useDynamicStore()

	const renderStep = () => {
		switch (modalSteps) {
			case 0:
				return (
					<GetStarted
						description="Get in front of people searching for you and similar content"
						onClick={() => updateModalStep(1)}
						title="Run Digital Ads"
						secondaryButton={true}
					/>
				)
			case 1:
				return <CampaignSetup type="search" />
			case 2:
				return <KeywordSelection />
			default:
				return (
					<GetStarted
						description="Get in front of people searching for you and similar content"
						onClick={() => updateModalStep(1)}
						title="Run Digital Ads"
						secondaryButton={true}
					/>
				)
		}
	}

	return renderStep()
}

export default SearchAdvertising
