import React, { memo, useState } from "react"
import { useFormContext } from "react-hook-form"

import { fetchUserSkills, fetchUserSkillsLevels } from "@/app/api/query"
import { DeleteIcon } from "@/assets"
import { useQuery } from "@tanstack/react-query"

import { useUserStore } from "@/stores"

import SelectInput from "./SelectInput"

interface Skill {
	type: string
	typeTitle: string
	level: string
	levelTitle: string
}

const SkillsList: React.FC = () => {
	const { userData } = useUserStore()
	const { setValue, getValues, watch } = useFormContext()

	// Watch for skills changes
	const skills = watch("skills") || []
	// Form state
	const [selectedSkill, setSelectedSkill] = useState("")
	const [selectedSkillTitle, setSelectedSkillTitle] = useState("")
	const [selectedLevel, setSelectedLevel] = useState("")
	const [selectedLevelTitle, setSelectedLevelTitle] = useState("")

	const { data: userSkills } = useQuery({
		queryKey: ["userSkills", userData?._id],
		queryFn: () => fetchUserSkills(userData?._id as string),
		enabled: !!userData?._id
	})

	const { data: userSkillsLevels } = useQuery({
		queryKey: ["userSkillsLevels", userData?._id],
		queryFn: () => fetchUserSkillsLevels(userData?._id as string),
		enabled: !!userData?._id
	})

	const skillOptions =
		userSkills?.map((skill: { _id: string; title: string }) => ({
			key: skill._id,
			label: skill.title
		})) || []

	const levelOptions =
		userSkillsLevels?.map((level: { _id: string; title: string }) => ({
			key: level._id,
			label: level.title
		})) || []

	const handleDeleteSkill = (id: string) => {
		const updatedSkills = skills.filter((skill: Skill) => skill.type !== id)
		setValue("skills", updatedSkills)
	}

	const handleAddSkill = () => {
		if (selectedSkill && selectedLevel) {
			const currentSkills = getValues("skills") || []
			const existingSkillIndex = currentSkills.findIndex(
				(skill: Skill) => skill.type === selectedSkill
			)

			if (existingSkillIndex !== -1) {
				// Replace existing skill with new level
				const updatedSkills = [...currentSkills]
				updatedSkills[existingSkillIndex] = {
					type: selectedSkill,
					typeTitle: selectedSkillTitle,
					level: selectedLevel,
					levelTitle: selectedLevelTitle
				}

				setValue("skills", updatedSkills)
			} else {
				// Add new skill
				const newSkill = {
					type: selectedSkill,
					typeTitle: selectedSkillTitle,
					level: selectedLevel,
					levelTitle: selectedLevelTitle
				}
				setValue("skills", [...currentSkills, newSkill])
			}

			// Reset form
			setSelectedSkill("")
			setSelectedSkillTitle("")
			setSelectedLevel("")
			setSelectedLevelTitle("")
		}
	}

	return (
		<div className="mt-8">
			<div className="text-[#33383F] text-sm font-semibold mr-1">
				Add New Skills
			</div>

			{/* Existing skills */}
			{skills.map((skill: Skill) => (
				<div
					key={skill.type}
					className="flex justify-between items-center mb-3 p-3 rounded-xl border-2 border-solid border-[#F4F4F4]"
				>
					<div>
						<div className="text-[#33383F] text-sm font-semibold">
							{skill.typeTitle || skill.type}
						</div>
						<div className="text-[#33383F] text-sm">
							(My level is {skill.levelTitle || skill.level})
						</div>
					</div>
					<DeleteIcon onClick={() => handleDeleteSkill(skill.type)} />
				</div>
			))}

			{/* Add new skill form */}
			<div>
				<div className="flex gap-3 mb-3 max-md:flex-col">
					<SelectInput
						options={skillOptions}
						value={selectedSkill}
						onChange={(value) => {
							const selected = skillOptions.find(
								(skill: { key: string; label: string }) => skill.key === value
							)
							setSelectedSkill(value)
							setSelectedSkillTitle(selected?.label || "")
						}}
						placeholder="Select a skill"
						className="w-full"
					/>

					<SelectInput
						options={levelOptions}
						value={selectedLevel}
						onChange={(value) => {
							const selected = levelOptions.find(
								(level: { key: string; label: string }) => level.key === value
							)
							setSelectedLevel(value)
							setSelectedLevelTitle(selected?.label || "")
						}}
						placeholder="Select level"
						className="w-full"
					/>
				</div>

				<div
					className="border text-[#1DB854] text-[10px] font-bold float-right px-4 py-1 rounded-lg border-solid border-[#1DB854] cursor-pointer hover:bg-[#f0fff5]"
					onClick={handleAddSkill}
				>
					Add
				</div>
			</div>
		</div>
	)
}

export default memo(SkillsList)
