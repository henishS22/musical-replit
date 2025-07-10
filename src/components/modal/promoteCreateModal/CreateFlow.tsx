import { useEffect } from "react"

import { PLUS_CIRCLE_ICON } from "@/assets"
import {
	initializeModalSteps,
	updateModalStep
} from "@/helpers/modalStepHelpers"

import { useDynamicStore } from "@/stores/dynamicStates"

import AudioFlow from "./audioFlow/AudioFlow"
import CreateSomethingNew from "./CreateSomethingNew"
import VideoFlow from "./VideoFlow"

const CreateFlow = () => {
	const { addState, CreateFlow } = useDynamicStore()

	useEffect(() => {
		initializeModalSteps()
	}, [])

	const handleInitialSelection = (type: "audio" | "video") => {
		addState("CreateFlow", {
			mediaType: type
		})
		updateModalStep(0)
	}

	if (!CreateFlow?.mediaType) {
		return (
			<CreateSomethingNew
				icon={PLUS_CIRCLE_ICON}
				title="Create Something New"
				label1="Record a Audio"
				label2="Record a Video"
				onClick1={() => handleInitialSelection("audio")}
				onClick2={() => handleInitialSelection("video")}
			/>
		)
	}

	//specific flow based on media type
	return CreateFlow?.mediaType === "audio" ? <AudioFlow /> : <VideoFlow />
}

export default CreateFlow
