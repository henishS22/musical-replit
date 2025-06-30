export const GO_VIRAL_OPTIONS = [
	{ key: "music_influencers", label: "Work with Music Influencers" }
]

export const getGoViralDropdownLabel = (value: string): string => {
	if (!value) return "Select an option"
	return (
		GO_VIRAL_OPTIONS.find((option) => option.key === value)?.label ||
		"Select an option"
	)
}
