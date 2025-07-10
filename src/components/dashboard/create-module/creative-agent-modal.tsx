"use client"

// import { useState } from "react"
// import { toast } from "react-toastify"
import Image from "next/image"

// import { updateTrack } from "@/app/api/mutation"
// import { useMutation } from "@tanstack/react-query"

// import { useDynamicStore } from "@/stores"
import { VisualsVideo } from "@/components/modal/WorkWithAiModal/VisualsVideo"
import { InputSection } from "@/components/ui/inputSection/InputSection"
import Loader from "@/components/ui/loader/loader"
import { CreativeAgentModalProps } from "@/types/workWithAiTypes"

// import { useGenerateMedia } from "@/hooks/useGenerateMedia"

export function CreativeAgentModal({
	onComplete,
	title = "Use your Creative Agent to enhance your recording",
	description = "Generate artwork that complements your track",
	icon,
	iconBgColor = "#E8FAF0",
	placeholder = "Message",
	inputIcon = { type: "mic" },
	isLoading = false,
	visualsStep,
	mediaType = "image",
	overlayModal = false,
	overlayType,
	selectedAction,
	setSelectedAction
}: CreativeAgentModalProps) {
	return (
		<div className="w-full max-w-[500px] mx-auto bg-white p-0">
			<div className="bg-[#FCFCFC] rounded-xl p-6">
				{visualsStep ||
				visualsStep === 1 ||
				visualsStep === 2 ||
				visualsStep === 3 ? (
					<VisualsVideo
						step={visualsStep}
						selectedAction={selectedAction as "modify" | "regenerate"}
						setSelectedAction={
							setSelectedAction as (action: "modify" | "regenerate") => void
						}
					/>
				) : (
					<div className="flex flex-col items-center gap-[47px] mb-[47px]">
						<div
							className="w-16 h-16 rounded-full flex items-center justify-center"
							style={{ backgroundColor: iconBgColor }}
						>
							{icon && (
								<Image src={icon} alt="Agent Icon" width={32} height={32} />
							)}
						</div>
						<div className="text-center">
							<h3 className="text-[#0A1629] text-base font-semibold mb-2">
								{title}
							</h3>
							<p className="text-[#0A1629] font-semibold text-base">
								{description}
							</p>
						</div>
					</div>
				)}
				{(!visualsStep || visualsStep === 0 || visualsStep === 2) && (
					<InputSection
						isDisabled={isLoading}
						placeholder={placeholder}
						inputIcon={inputIcon}
						onComplete={(file, type, text) => onComplete?.(file, type, text)}
						mediaType={mediaType}
					/>
				)}
			</div>
			{overlayModal && <Loader isOpen={isLoading} type={overlayType} />}
		</div>
	)
}
