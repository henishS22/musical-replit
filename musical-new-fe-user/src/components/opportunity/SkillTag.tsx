"use client"

import React from "react"
import Image from "next/image"

import { CHECK, PLUS } from "@/assets"

interface SkillTagProps {
	skill: string
	active?: boolean
}

export const SkillTag: React.FC<SkillTagProps> = ({ skill, active }) => {
	const baseClasses =
		"flex flex-col self-stretch px-2 my-auto rounded-lg border border-solid"
	const activeClasses = active
		? "text-white bg-green-600"
		: "bg-zinc-100 border-zinc-100 text-neutral-700"

	return (
		<div className={`${baseClasses} ${activeClasses}`}>
			<div className="flex gap-1.5 items-center w-full text-xs font-medium tracking-normal leading-6 whitespace-nowrap">
				{active ? (
					<Image
						src={CHECK}
						alt="check"
						className="object-contain shrink-0 self-stretch my-auto w-3 aspect-square"
						height={12}
						width={12}
					/>
				) : (
					<Image
						src={PLUS}
						alt="add-skill"
						className="object-contain shrink-0 self-stretch my-auto w-3 aspect-square"
						height={12}
						width={12}
					/>
				)}
				<div className="self-stretch my-auto">{skill}</div>
			</div>
		</div>
	)
}
