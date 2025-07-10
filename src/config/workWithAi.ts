export const AI_DROPDOWN_OPTIONS = [
	{ key: "song", label: "Song Ideas and Lyrics" },
	{ key: "melody", label: "Work with Melodies" },
	{ key: "visual", label: "Generate Visuals" }
]

export const getAiDropdownLabel = (value: string): string => {
	if (!value) return "Select an option"
	return (
		AI_DROPDOWN_OPTIONS.find((option) => option.key === value)?.label ||
		"Select an option"
	)
}
