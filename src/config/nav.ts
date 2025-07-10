export interface NavItem {
	title: string
	iconName: "discover" | "library" | "market" | "projects" | "home" | "missions"
	href: string
}

export const navConfig: NavItem[] = [
	{
		title: "Home",
		href: "/dashboard",
		iconName: "home"
	},
	{
		title: "Library",
		href: "/library",
		iconName: "library"
	},
	{
		title: "Projects",
		href: "/project",
		iconName: "projects"
	},
	{
		title: "Missions",
		href: "/missions",
		iconName: "missions"
	},
	{
		title: "Community",
		href: "/community",
		iconName: "discover"
	},
	{
		title: "Market",
		href: "/marketplace",
		iconName: "market"
	}
]
