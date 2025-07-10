import { PLUS_CIRCLE_ICON } from "@/assets"
import { updateModalStep } from "@/helpers/modalStepHelpers"

import { useDynamicStore } from "@/stores"

import CreateSomethingNew from "../CreateSomethingNew"
import RecordAIAudio from "./RecordAi"
import RecordSelfAudio from "./RecordSelf"

const AudioFlow = () => {
	const { updateState, CreateFlow } = useDynamicStore()

	const handleCreationTypeSelect = (type: "self" | "ai") => {
		updateState("CreateFlow", {
			creationType: type
		})
		updateModalStep(0) // Start at 0 for step components array indexing
	}

	// If recording type is not yet selected, show initial selection
	if (!CreateFlow?.creationType) {
		return (
			<CreateSomethingNew
				icon={PLUS_CIRCLE_ICON}
				title="Create Something New"
				label1="Record Self Audio"
				label2="Create with AI"
				onClick1={() => handleCreationTypeSelect("self")}
				onClick2={() => handleCreationTypeSelect("ai")}
			/>
		)
	}

	// Render appropriate component based on creation type
	return CreateFlow.creationType === "self" ? (
		<RecordSelfAudio />
	) : (
		<RecordAIAudio />
	)
}

export default AudioFlow
