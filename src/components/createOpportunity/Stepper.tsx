import React from "react"

import { Check } from "lucide-react"

interface StepperProps {
	currentStep: number
	stepsCompleted: boolean[]
	steps: string[]
}

const labelPositions = [32, -13, -29, -25, -10]

const Stepper: React.FC<StepperProps> = ({
	steps,
	currentStep,
	stepsCompleted = [false, false, false, false, false]
}) => {
	return (
		<div className="flex flex-col w-full space-y-6 items-center bg-white px-6 pt-6 pb-10 rounded-lg">
			<div className="flex items-center justify-between w-[92%]">
				<div className="flex items-center justify-between w-full">
					{steps.map((step, index) => (
						<div
							key={index}
							className={`flex items-center ${
								index === steps.length - 1 ? "" : "flex-1"
							}`}
						>
							<div
								className={`flex items-center justify-center rounded-full border-2 ${index === currentStep || stepsCompleted[index] ? "border-[#1DB954]" : "border-[#C6C6C6]"}`}
							>
								{/* Circle with step completion indicator */}
								<div
									className={`w-9 h-9 flex items-center justify-center rounded-full relative transition-colors
                  ${
										stepsCompleted[index]
											? "bg-gradient-to-b from-[#1DB954] to-[#0D5326] text-white"
											: "bg-white"
									}`}
								>
									{stepsCompleted[index] ? (
										<Check className="w-4 h-4" />
									) : index === currentStep ? (
										<div className="w-2 h-2 bg-gradient-to-b from-[#1DB954] to-[#0D5326] rounded-full" />
									) : null}

									{/* labels */}
									<span
										key={index}
										className={`bottom-[-22px] absolute text-center text-nowrap text-base font-medium leading-[16px] tracking-[0.5px] text-[#6F6F6F] left-[${labelPositions[index]}px]`}
									>
										{step}
									</span>
								</div>
							</div>

							{/* Connector Line inside Circle */}
							{index < steps.length - 1 && (
								<div
									className={`w-full h-[1px] bg-gray-300 ${stepsCompleted[index] ? "bg-gradient-to-b from-[#1DB954] to-[#0D5326]" : "bg-gray-300"}`}
								/>
							)}

							{/* Step Label */}
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

export default Stepper
