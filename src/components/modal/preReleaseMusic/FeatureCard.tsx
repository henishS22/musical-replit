import React from "react"
import Image, { StaticImageData } from "next/image"
import { useParams, useRouter } from "next/navigation"

import { EXISTINGPRO_MODAL } from "@/constant/modalType"

import { useDynamicStore, useModalStore } from "@/stores"

export interface FeatureCardProps {
	imageSrc: string | StaticImageData
	title: string
	description: string
	setSelectedProject?: (project: string) => void
	project: string
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
	imageSrc,
	title,
	description
	// setSelectedProject,
	// project
}) => {
	const { addState, removeState } = useDynamicStore()
	const { showCustomModal, hideCustomModal } = useModalStore()
	const router = useRouter()
	const { id } = useParams()
	return (
		<div
			className="flex flex-col grow shrink justify-center items-center px-5 py-8 rounded-lg border-2 border-solid border-zinc-100 min-w-[240px] w-[318px] cursor-pointer"
			onClick={() => {
				// if (setSelectedProject) {
				// setSelectedProject(project)
				addState("tokenDescription", description)
				addState("releaseModalWidth", "max-w-[540px]")
				if (!id) {
					removeState("projectIdFromDetails")
					showCustomModal({
						customModalType: EXISTINGPRO_MODAL,
						tempCustomModalData: {
							handleNext: () => {
								router.push("/create-token")
								hideCustomModal()
							},
							showProjectTracks: true
						}
					})
				} else {
					addState("projectIdFromDetails", id)
					showCustomModal({
						customModalType: EXISTINGPRO_MODAL,
						tempCustomModalData: {
							handleNext: () => {
								router.push("/create-token")
								hideCustomModal()
							},
							showProjectTracks: true
						}
					})
				}

				// }
			}}
		>
			<Image
				loading="lazy"
				src={imageSrc}
				alt={`Feature icon for ${title}`}
				className="object-contain w-20 rounded-lg aspect-square"
				width={80}
				height={80}
			/>
			<div className="mt-2.5 text-base font-bold">{title}</div>
			<div className="self-stretch mt-2.5 text-base font-medium tracking-normal leading-6">
				{description}
			</div>
		</div>
	)
}
