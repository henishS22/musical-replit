"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { LOGO } from "@/assets"
import DiscoverIcon from "@/assets/icons/DiscoverIcon"
import HomeIcon from "@/assets/icons/HomeIcon"
import LibraryIcon from "@/assets/icons/LibraryIcon"
import MarketIcon from "@/assets/icons/MarketIcon"
import MissionsIcon from "@/assets/icons/MissionsIcon"
import ProjectsIcon from "@/assets/icons/ProjectsIcon"
import clsx from "clsx"

import { navConfig } from "@/config"
import { NavItem } from "@/config/nav"
import { useDynamicStore, useUserStore } from "@/stores"

const iconComponents = {
	discover: DiscoverIcon,
	library: LibraryIcon,
	market: MarketIcon,
	projects: ProjectsIcon,
	home: HomeIcon,
	missions: MissionsIcon
}

const gradientId = "navIconGradient"

export const Nav = () => {
	const pathname = usePathname()
	const { removeState } = useDynamicStore()
	const { user } = useUserStore()

	if (!navConfig) return null

	const getNavItemId = (iconName: string): string => {
		const navItemTypes: Record<string, string> = {
			home: "home-menu-item",
			library: "library-link",
			market: "market-link",
			projects: "projects-link",
			discover: "community-link",
			missions: "missions-link"
		}
		return navItemTypes[iconName] || ""
	}

	return (
		<aside className="bg-white shadow-md fixed top-0 left-0 max-w-64 w-full h-full overflow-hidden z-10 hidden lg:block">
			<svg width="0" height="0">
				<defs>
					<linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
						<stop offset="0%" stopColor="#1DB954" />
						<stop offset="100%" stopColor="#0D5326" />
					</linearGradient>
				</defs>
			</svg>
			<div className="p-4 text-lg font-bold min-h-[96px] flex items-center cursor-pointer">
				<Link
					href="/"
					className={`${!user && "pointer-events-none opacity-50 cursor-not-allowed"}`}
				>
					<Image
						src={LOGO as unknown as string}
						height={LOGO.height}
						width={160}
						alt="logo"
					/>
				</Link>
			</div>
			<nav className="mt-4">
				<ul>
					{navConfig?.map(({ title, iconName, href = "/" }: NavItem) => {
						const IconComponent = iconComponents[iconName]
						const isActive = pathname.startsWith(href)

						return (
							<li
								key={href}
								className={`py-[13px] pl-6 relative ${
									isActive ? "bg-[#DDF5E5]" : ""
								} ${!user && title !== "Market" && "pointer-events-none opacity-50 cursor-not-allowed"}`}
								id={getNavItemId(iconName)}
							>
								<Link
									href={href}
									className={clsx(
										"flex items-center text-base relative",
										isActive
											? "text-[#0D0D0D] font-semibold"
											: "text-[#949494] font-medium"
									)}
									onClick={() => {
										if (title === "Library") {
											removeState("schedulePostData")
										}
									}}
								>
									<IconComponent
										className="mr-4 h-6 w-6"
										fillColor={isActive ? `url(#${gradientId})` : "#949494"}
									/>
									{title}
								</Link>
								{isActive && (
									<div className="active-border absolute right-0 top-0 h-full w-1.5"></div>
								)}
							</li>
						)
					})}
				</ul>
			</nav>
		</aside>
	)
}
