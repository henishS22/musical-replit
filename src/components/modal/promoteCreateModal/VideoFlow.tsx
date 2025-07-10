import { useCallback, useEffect } from "react"

import { PLUS_CIRCLE_ICON } from "@/assets"
import { VideoModal } from "@/components/dashboard/create-module/video-modal"
import { PURCHASE_SUBSCRIPTION_MODAL } from "@/constant/modalType"
import { updateModalStep } from "@/helpers/modalStepHelpers"

import { useModalStore, useUserStore } from "@/stores"
import { useDynamicStore } from "@/stores/dynamicStates"

import Visuals from "../WorkWithAiModal/Visuals"
import CreateSomethingNew from "./CreateSomethingNew"

const VideoFlow = () => {
	const { updateState, CreateFlow, addState, dropdownSteps } = useDynamicStore()
	const { showCustomModal } = useModalStore()
	const { subscriptionFeatures } = useUserStore()
	useEffect(() => {
		if (!dropdownSteps) {
			addState("dropdownSteps", 0)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const handleCreationTypeSelect = useCallback(
		(type: "self" | "ai") => {
			if (!subscriptionFeatures?.[10]?.available && type === "ai") {
				showCustomModal({
					customModalType: PURCHASE_SUBSCRIPTION_MODAL
				})
			} else {
				updateState("CreateFlow", {
					creationType: type
				})
				updateModalStep(0) // Start at 0 for step components array indexing
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[updateState]
	)

	if (!CreateFlow?.creationType) {
		return (
			<CreateSomethingNew
				icon={PLUS_CIRCLE_ICON}
				title="Create Video"
				label1="Record Self Video"
				label2="Create with AI"
				onClick1={() => handleCreationTypeSelect("self")}
				onClick2={() => handleCreationTypeSelect("ai")}
			/>
		)
	}

	return CreateFlow?.creationType === "self" ? <VideoModal /> : <Visuals />
}

export default VideoFlow
