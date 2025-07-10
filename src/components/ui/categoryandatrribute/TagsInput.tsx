import React, { useEffect, useState } from "react"
import { UseFormSetValue } from "react-hook-form"
import { MultiValue, Options, SingleValue } from "react-select"

import { INft } from "@/types/apiResponse"
import { LivestreamFormData } from "@/types/livestream"
import { UploadFormData } from "@/validationSchema/UploadWorkSchema"

import { useLibraryStore } from "@/stores"

import CustomSelect from "../customSelect/CustomSelect"
import CustomTooltip from "../tooltip"

interface TagsInputProps {
	maxTags?: number
	title: string
	tooltipContent?: string
	setValue: UseFormSetValue<UploadFormData | LivestreamFormData>
	setValueData?: string
	defaultValue?: string[]
	data?: INft[]
	isLoading?: boolean
	placeholder?: string
	name?: string
}

const TagsInput: React.FC<TagsInputProps> = ({
	maxTags,
	title,
	tooltipContent,
	setValue,
	defaultValue,
	data,
	isLoading,
	setValueData,
	placeholder = "Select tags"
}) => {
	const [selectedOptions, setSelectedOptions] = useState<
		MultiValue<{ value: string; label: string }>
	>([])

	const { tags } = useLibraryStore()
	const [options, setOptions] = useState<
		Options<{ value: string; label: string }>
	>([])

	const handleChange = (
		selected:
			| MultiValue<{ value: string; label: string }>
			| SingleValue<{ value: string; label: string }>
	) => {
		if (!selected || !Array.isArray(selected)) {
			setSelectedOptions([])
			setValue(
				setValueData ? (setValueData as keyof UploadFormData) : "tags",
				[],
				{ shouldDirty: true }
			) // Clear tags if no selection
			return
		}

		setSelectedOptions(selected)
		const tags = selected.map((option) => option.value)
		setValue(
			setValueData ? (setValueData as keyof UploadFormData) : "tags",
			tags,
			{ shouldDirty: true }
		) // Ensure `tags` matches your form schema
	}

	useEffect(() => {
		if (data) {
			const defaultData = data?.map((item) => {
				return {
					value: item._id,
					label: item.title
				}
			})
			setOptions(defaultData)
		} else if (tags?.length) {
			const data = tags.map((item) => {
				return {
					value: item._id,
					label: item.title
				}
			})
			setOptions(data)
		}
	}, [tags, data])

	useEffect(() => {
		if (defaultValue) {
			const data = options.filter((item) => defaultValue.includes(item.value))
			setSelectedOptions(data)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [defaultValue])

	return (
		<div className="flex flex-col mt-6">
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2">
					<h2 className="text-sm font-bold text-inputLabel">{title}</h2>
					{tooltipContent && <CustomTooltip tooltipContent={tooltipContent} />}
				</div>
				{maxTags && (
					<p className="text-sm text-gray-600">
						{selectedOptions.length}/{maxTags} tags
					</p>
				)}
			</div>
			<CustomSelect
				isLoading={isLoading}
				options={options}
				isMulti={true}
				placeholder={placeholder}
				value={selectedOptions}
				onChange={handleChange}
				maxTags={maxTags}
			/>
		</div>
	)
}

export default TagsInput
