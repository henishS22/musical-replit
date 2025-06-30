import React, { useEffect, useState } from "react"
import { UseFormSetValue } from "react-hook-form"

import { ProfileFormValues } from "@/components/profile/editProfile/PersonalInfo"
import { StyleAndSkillsFormValues } from "@/components/profile/editProfile/StyleAndSkills"
import { Category } from "@/types"
import { UploadFormData } from "@/validationSchema/UploadWorkSchema"
import { Checkbox, Input } from "@nextui-org/react"

import CustomTooltip from "../tooltip"

interface CategoryAttributesProps {
	title: string
	tooltipContent?: string
	categories: Category[]
	setValue: UseFormSetValue<
		UploadFormData | ProfileFormValues | StyleAndSkillsFormValues
	>
	getValues: (field: string) => string[]
	name: string
	error?: string
	defaultValue?: string[]
}

const CategoryAttributes: React.FC<CategoryAttributesProps> = ({
	title,
	tooltipContent = "Select options",
	categories,
	setValue,
	getValues,
	name,
	// error,
	defaultValue
}) => {
	const [selectedCategories, setSelectedCategories] = useState<string[]>([])
	const [searchQuery, setSearchQuery] = useState("")
	const [showAll, setShowAll] = useState(false)
	const INITIAL_DISPLAY_COUNT = 9

	// Initialize selected categories from defaultValue or form state
	useEffect(() => {
		if (defaultValue) {
			setSelectedCategories(defaultValue)
		} else {
			setSelectedCategories(getValues(name) || [])
		}
		// Only run this effect on mount or when defaultValue changes
	}, [defaultValue, getValues, name])

	const handleCategoryChange = (id: string) => {
		const updatedValues = selectedCategories.includes(id)
			? selectedCategories.filter((categoryId) => categoryId !== id)
			: [...selectedCategories, id]

		// Update both local and form state
		setSelectedCategories(updatedValues)
		setValue(name as keyof UploadFormData, updatedValues, { shouldDirty: true })
	}

	const filteredCategories = categories.filter((category) =>
		category.label.toLowerCase().includes(searchQuery.toLowerCase())
	)

	const displayedCategories = showAll
		? filteredCategories
		: filteredCategories.slice(0, INITIAL_DISPLAY_COUNT)

	return (
		<div className="flex flex-col mt-6">
			<div className="flex items-center gap-2 mb-4">
				<h2 className="text-sm font-bold text-[#33383F]">{title}</h2>
				{tooltipContent && <CustomTooltip tooltipContent={tooltipContent} />}
			</div>

			<div className="mb-4">
				<Input
					placeholder="Search categories..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="max-w-xs"
				/>
			</div>

			<div className="grid grid-cols-3 gap-4">
				{displayedCategories.map((category) => (
					<div key={category.value} className="flex items-center gap-3">
						<Checkbox
							isSelected={selectedCategories.includes(category.value)}
							onChange={() => handleCategoryChange(category.value)}
							color="success"
							size="lg"
						>
							<div className="text-base font-semibold text-[#1A1D1F]">
								{category.label}
							</div>
						</Checkbox>
					</div>
				))}
			</div>

			{filteredCategories.length > INITIAL_DISPLAY_COUNT && (
				<button
					onClick={() => setShowAll(!showAll)}
					type="button"
					className="mt-4 text-sm text-blue-600 hover:text-blue-800 self-start"
				>
					{showAll ? "Show Less" : `Show All (${filteredCategories.length})`}
				</button>
			)}

			{/* {error && <p className="text-red-500 text-sm mt-2">{error}</p>} */}
		</div>
	)
}

export default CategoryAttributes
