import { useDynamicStore } from "@/stores"

export const updateModalStep = (step: number) => {
	const { modalStepHistory, updateState, addState } = useDynamicStore.getState()
	const currentHistory = modalStepHistory || []

	addState("modalStepHistory", currentHistory.concat(step))
	updateState("modalSteps", step)
}

export const handleModalStepBack = () => {
	const { modalStepHistory, updateState, addState } = useDynamicStore.getState()
	const currentHistory = modalStepHistory || []

	if (currentHistory.length > 1) {
		const newHistory = currentHistory.slice(0, -1)
		const previousStep = newHistory[newHistory.length - 1]

		addState("modalStepHistory", newHistory)
		updateState("modalSteps", previousStep)
	}
}

export const resetModalSteps = () => {
	const { removeState } = useDynamicStore.getState()
	removeState("modalSteps")
	removeState("modalStepHistory")
}

export const initializeModalSteps = () => {
	const { addState } = useDynamicStore.getState()
	addState("modalStepHistory", [0])
}

// New helper function for resetting to a specific step
export const resetModalStepsTo = (step: number) => {
	const { updateState, addState } = useDynamicStore.getState()
	addState("modalStepHistory", [0, step])
	updateState("modalSteps", step)
}
