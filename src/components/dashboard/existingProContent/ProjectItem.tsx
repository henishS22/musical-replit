import Image from "next/image"

import { RHYTHM } from "@/assets"
import { ProjectResponse } from "@/types/dashboarApiTypes"
import { differenceInHours } from "date-fns"

interface ProjectItemProps {
	project: ProjectResponse
	className?: string
	onSelect?: () => void
	isSelected?: boolean
	height?: number
	width?: number
	showRemove?: boolean
	onRemove?: () => void
}

export const ProjectItem = ({
	project,
	className = "",
	onSelect,
	isSelected,
	height = 80,
	width = 80,
	showRemove = false,
	onRemove
}: ProjectItemProps) => {
	return (
		<div
			className={` ${!isSelected ? "" : "bg-hoverGray"} flex items-center justify-between gap-4 cursor-pointer px-4 py-3 border-2 border-hoverGray rounded-lg hover:bg-hoverGray ${className}`}
			onClick={onSelect}
		>
			<div className="flex items-center gap-4">
				<Image
					src={project.artworkUrl || RHYTHM}
					alt={project.name}
					width={width}
					height={height}
					className={`w-[${width}px] h-[${height}px] rounded`}
				/>
				<div>
					<h3 className="text-base font-bold text-[#33383F]">{project.name}</h3>
					{project?.updatedAt && (
						<p className="text-[10px] font-normal leading-[15px] text-textGray">
							{`Edited ${
								Math.abs(
									differenceInHours(new Date(project.updatedAt), new Date())
								) > 1
									? `${Math.abs(differenceInHours(new Date(project.updatedAt), new Date()))} hours`
									: `${Math.abs(differenceInHours(new Date(project.updatedAt), new Date()))} hour`
							} ago`}
						</p>
					)}
				</div>
			</div>
			{showRemove && (
				<span className="text-red-500 text-sm" onClick={onRemove}>
					Remove
				</span>
			)}
		</div>
	)
}
