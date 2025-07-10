export interface DropdownConfig {
	activeLabel: string
	value?: string
	options: { key: string; label: string }[]
	onChange?: (key: string) => void
	isStatic?: boolean
	isStaticIcon?: boolean
}

export interface BreadcrumbProps {
	title: string
	dropdownConfig: DropdownConfig
	onBack: () => void
}
