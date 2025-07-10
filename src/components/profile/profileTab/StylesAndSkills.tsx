"use client"

import React from "react"

import { PreferredStyle, Skill } from "@/stores/user"

interface SkillFieldProps {
	label: string
	items: Array<Skill | PreferredStyle>
	isPreferredStyles: boolean
}

const SkillField: React.FC<SkillFieldProps> = ({
	label,
	items,
	isPreferredStyles
}) => (
	<div className="flex flex-col flex-1 shrink whitespace-nowrap basis-0 min-w-[240px] max-md:max-w-full">
		<div className="flex flex-col w-full max-md:max-w-full">
			<div className="flex gap-3 items-center w-full text-sm tracking-normal text-neutral-700 max-md:max-w-full">
				<div className="flex flex-1 shrink gap-2 items-center self-stretch py-0.5 my-auto w-full basis-0 min-w-[240px] max-md:max-w-full">
					<div className="flex gap-1 items-center self-stretch my-auto">
						<div className="self-stretch my-auto">{label}</div>
						<div className="flex shrink-0 self-stretch my-auto w-4 h-4" />
					</div>
				</div>
			</div>
			<div className="flex gap-1 items-start self-start mt-1 text-xs tracking-normal text-gray-500 flex-wrap">
				{items.length > 0 ? (
					items.map((item, index) => (
						<div
							key={index}
							className="flex flex-col px-2 rounded-lg border border-solid border-zinc-100"
						>
							<div className="gap-1.5 self-stretch w-full">
								{isPreferredStyles
									? "title" in item && item.title.en
									: "type" in item
										? `${item.type.title.en} - ${item.level.title.en}`
										: ""}
							</div>
						</div>
					))
				) : (
					<div className="flex flex-col px-2 rounded-lg border border-solid border-zinc-100">
						<div className="gap-1.5 self-stretch w-full">No {label} added</div>
					</div>
				)}
			</div>
		</div>
	</div>
)

const StylesAndSkills: React.FC<{
	preferredStyles: PreferredStyle[]
	skills: Skill[]
}> = ({ preferredStyles, skills }) => {
	return (
		<>
			<div className="flex mt-8 w-full rounded-sm bg-zinc-100 min-h-[1px] max-md:max-w-full" />
			<div className="flex flex-col mt-8 w-full max-md:max-w-full">
				<div className="flex flex-wrap gap-10 justify-between items-center w-full text-zinc-900 max-md:max-w-full">
					<div className="gap-4 self-stretch my-auto text-xl font-semibold tracking-tight leading-relaxed">
						Style & Skills
					</div>
				</div>
				<div className="flex flex-wrap gap-5 items-start mt-5 w-full font-medium leading-6 max-md:max-w-full">
					<SkillField
						label="Styles"
						items={preferredStyles || []}
						isPreferredStyles={true}
					/>
					<SkillField
						label="New Skills"
						items={skills || []}
						isPreferredStyles={false}
					/>
				</div>
			</div>
		</>
	)
}

export default StylesAndSkills
