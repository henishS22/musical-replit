import Image from "next/image"

import { RHYTHM } from "@/assets"
import { ProjectResponse } from "@/types/dashboarApiTypes"
import { differenceInHours } from "date-fns"

interface ProjectCardProps {
	project: ProjectResponse
	isSelected?: boolean
	onSelect?: () => void
	isUsedProject?: boolean
}

const ProjectCard = ({
	project,
	isSelected,
	onSelect,
	isUsedProject
}: ProjectCardProps) => {
	return (
		<div className="relative w-[218px] max-w-[218px]">
			<div
				className={`flex flex-col gap-4 px-3 py-[10px] flex-1 ${
					isSelected ? "bg-[#E6F0FD]" : "bg-[#DFDFDF]"
				} rounded-lg relative ${isUsedProject ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
				onClick={!isUsedProject ? onSelect : undefined}
			>
				<div className="w-full">
					<Image
						src={project?.artworkUrl || RHYTHM}
						alt={project?.name}
						width={194}
						height={158}
						className="w-full max-h-[158px] object-cover rounded-sm max-w-[194px]"
					/>
				</div>
				<div className="flex flex-col">
					<p className="text-md font-medium">{project?.name}</p>
					<p className="text-sm text-zinc-500">{`Edited ${
						Math.abs(
							differenceInHours(
								new Date(project?.updatedAt || new Date()),
								new Date()
							)
						) > 1
							? `${Math.abs(differenceInHours(new Date(project?.updatedAt || new Date()), new Date()))} hours`
							: `${Math.abs(differenceInHours(new Date(project?.updatedAt || new Date()), new Date()))} hour`
					} ago`}</p>
				</div>
			</div>
			{isUsedProject && (
				<div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg max-w-[218px]">
					<p className="text-white text-center text-sm font-medium px-4">
						This project is already used in another collaboration
					</p>
				</div>
			)}
		</div>
	)
}

export default ProjectCard
