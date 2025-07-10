import { useEffect } from "react"
import Joyride from "react-joyride"
import { usePathname, useRouter } from "next/navigation"

import { TOUR_STEPS } from "@/config/tour"
import { useDynamicStore, useUserStore } from "@/stores"

export const TourGuide = () => {
	const router = useRouter()
	const pathname = usePathname()
	const { isFirstLogin, setIsFirstLogin } = useUserStore()
	const { TakeTour, updateState } = useDynamicStore()

	// Redirect to dashboard if tour starts from another page
	useEffect(() => {
		if ((isFirstLogin || TakeTour) && pathname !== "/dashboard") {
			router.push("/dashboard")
		}
	}, [TakeTour, pathname, router, isFirstLogin])

	// Only show tour on dashboard
	if ((isFirstLogin || TakeTour) && pathname !== "/dashboard") {
		return null
	}

	return (
		<Joyride
			steps={TOUR_STEPS}
			run={isFirstLogin || TakeTour}
			disableScrolling
			showProgress
			showSkipButton
			continuous
			styles={{
				tooltipTitle: {
					fontSize: "16px",
					fontWeight: "bold",
					color: "#1A1D1F",
					marginBottom: "10px"
				},
				tooltipContent: {
					fontSize: "14px",
					fontWeight: "normal",
					color: "#1A1D1F",
					lineHeight: "1.5"
				},
				buttonNext: {
					background:
						"linear-gradient(175.57deg, #1DB653 3.76%, #0E5828 96.59%)",
					color: "#ffffff",
					padding: "8px 16px",
					borderRadius: "4px"
				},
				buttonBack: {
					backgroundColor: "#DDF5E5",
					color: "#1A1D1F",
					padding: "8px 16px",
					borderRadius: "4px",
					marginRight: "10px"
				}
			}}
			callback={(data) => {
				if (
					data.status === "finished" ||
					data.status === "skipped" ||
					data.action === "close"
				) {
					updateState("TakeTour", false)
					setIsFirstLogin(false)
				}
			}}
			spotlightClicks={false}
		/>
	)
}
