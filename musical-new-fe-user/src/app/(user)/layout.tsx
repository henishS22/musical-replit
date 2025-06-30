/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { ReactNode, useEffect, useState } from "react"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"

import { CHAT_POPUP_ICON } from "@/assets"
import UserLayout from "@/components/layout/UserLayout"
import ChatPopup from "@/components/streamChat/ChatPopup"

import { useDynamicStore, useUserStore } from "@/stores"

interface LayoutProps {
	children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
	const { subscriptionFeatures, user } = useUserStore()
	const { updateState } = useDynamicStore()
	const router = useRouter()
	const pathname = usePathname()

	const pathsToShowUpgradeOverlay = ["/library", "/subscription"]

	// Show upgrade overlay when user needs to upgrade and not on library page
	const showUpgradeOverlay =
		subscriptionFeatures &&
		!subscriptionFeatures[0]?.available &&
		!pathsToShowUpgradeOverlay.includes(pathname)
	const [isChatOpen, setIsChatOpen] = useState(
		useDynamicStore.getState().ChatPop?.open || false
	)

	useEffect(() => {
		setIsChatOpen(useDynamicStore.getState().ChatPop?.open || false)
	}, [useDynamicStore.getState().ChatPop?.open])

	useEffect(() => {
		if (isChatOpen) {
			document.querySelector("body")?.classList.add("overflow-hidden")
		} else {
			document.querySelector("body")?.classList.remove("overflow-hidden")
		}
	}, [isChatOpen])

	return (
		<UserLayout>
			<div className="relative">
				{children}
				{/* Upgrade Overlay */}
				{showUpgradeOverlay && (
					<div className="fixed inset-0 z-[100] flex items-center justify-center">
						<div className="absolute inset-0 bg-black/50 backdrop-blur-md" />
						<div className="relative z-10 bg-white rounded-xl p-8 max-w-md mx-4 text-center shadow-2xl transform transition-all">
							<h2 className="text-2xl font-bold text-gray-900 mb-4">
								Storage Upgrade Required
							</h2>
							<p className="text-gray-600 mb-6">
								You need to upgrade your storage plan to use this feature.
							</p>
							<div className="flex gap-4 justify-center">
								<button
									onClick={() => router.push("/subscription")}
									className="px-6 py-2 bg-btnColor text-white rounded-lg hover:bg-btnColorHover transition-colors"
								>
									Upgrade Now
								</button>
							</div>
						</div>
					</div>
				)}
				{/* Chat Button */}
				{!isChatOpen && user && (
					<button
						onClick={() => setIsChatOpen(!isChatOpen)}
						id="chatbot-icon"
						className="fixed bottom-8 left-[80px] transform-translate-x-1/2 z-50 rounded-full bg-gradient-to-br from-gray-700 via-green-700 to-blue-700 hover:from-gray-800 hover:via-green-800 hover:to-blue-800 transition-all p-4 shadow-[0_4px_12px_rgba(0,0,0,0.2),0_8px_24px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.3),0_12px_32px_rgba(0,0,0,0.15)]  hover:scale-105 active:scale-95"
					>
						<Image
							src={CHAT_POPUP_ICON}
							alt="Chat"
							width={48}
							height={48}
							className="cursor-pointer drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)] image-rendering-crisp"
							quality={100}
							style={{
								imageRendering: "crisp-edges",
								WebkitFontSmoothing: "antialiased"
							}}
						/>
					</button>
				)}
				<ChatPopup
					isChatOpen={isChatOpen}
					onClose={() => {
						setIsChatOpen(false)
						updateState("ChatPop", {
							open: false,
							id: null
						})
					}}
				/>
			</div>
		</UserLayout>
	)
}
