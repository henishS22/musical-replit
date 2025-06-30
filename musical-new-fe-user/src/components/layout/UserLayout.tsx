import { ReactNode } from "react"
import { usePathname } from "next/navigation"

import { Header, Nav } from "@/shared"
import { useDynamicStore, useUserStore } from "@/stores"

import { TourGuide } from "../tourGuide/TourGuide"

interface LayoutProps {
	children: ReactNode
}

export default function UserLayout({ children }: LayoutProps) {
	const pathname = usePathname()
	const { isFirstLogin } = useUserStore()
	const { TakeTour } = useDynamicStore()
	const pages = ["/create-token", "/project", "/profile"]

	return (
		<div className="flex">
			{/* Sidebar */}
			<Nav />
			{/* Main Content */}
			<div className="flex-1 max-w-[calc(100%-256px)] w-full ml-auto">
				<Header />
				<div
					className={`bg-[#f4f4f4] fluid-container min-h-[calc(100vh-98px)] ${pages.some((page) => pathname.startsWith(page)) ? "" : "p-6"}`}
				>
					{children}
				</div>
				{(isFirstLogin || TakeTour) && <TourGuide />}
			</div>
		</div>
	)
}
