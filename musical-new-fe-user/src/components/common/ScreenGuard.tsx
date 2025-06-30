"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

import MobileRedirect from "./MobileRedirect"

const MIN_WIDTH = 1100 // px

export default function ScreenGuard({
	children
}: {
	children: React.ReactNode
}) {
	const [isSmall, setIsSmall] = useState(false)
	const pathname = usePathname()

	const shouldApplyScreenGuard = !pathname.includes("/coinflow-subscription")
	const check = () => setIsSmall(window.innerWidth < MIN_WIDTH)

	useEffect(() => {
		check()
		window.addEventListener("resize", check)
		return () => window.removeEventListener("resize", check)
	}, [])

	if (isSmall && shouldApplyScreenGuard) return <MobileRedirect />
	return <>{children}</>
}
