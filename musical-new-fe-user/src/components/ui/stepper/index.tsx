// components/Stepper.tsx
import React, { useState } from "react"

import { Button } from "@nextui-org/react"

const steps = ["Step 1", "Step 2", "Step 3"]

const Stepper = () => {
	const [currentStep, setCurrentStep] = useState(0)

	const isLastStep = currentStep === steps.length - 1

	const handleNext = () => {
		if (!isLastStep) setCurrentStep((prev) => prev + 1)
	}

	const handleBack = () => {
		if (currentStep > 0) setCurrentStep((prev) => prev - 1)
	}

	return (
		<div className="flex flex-col items-center space-y-4">
			<div className="flex items-center space-x-4">
				{steps.map((step, index) => (
					<div key={index} className="flex items-center space-x-2">
						<div
							className={`w-8 h-8 flex items-center justify-center rounded-full ${
								index === currentStep
									? "bg-blue-500 text-white"
									: "bg-gray-300 text-gray-600"
							}`}
						>
							{index + 1}
						</div>
						{index < steps.length - 1 && (
							<div
								className={`h-1 w-12 ${
									index < currentStep ? "bg-blue-500" : "bg-gray-300"
								}`}
							></div>
						)}
					</div>
				))}
			</div>

			<div className="text-lg font-semibold">
				{steps[currentStep]}: Content goes here.
			</div>

			<div className="flex space-x-4">
				<Button
					isDisabled={currentStep === 0}
					color="primary"
					onPress={handleBack}
				>
					Back
				</Button>
				<Button color="primary" onPress={handleNext} isDisabled={isLastStep}>
					{isLastStep ? "Finish" : "Next"}
				</Button>
			</div>
		</div>
	)
}

export default Stepper
