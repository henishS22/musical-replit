"use client"

import { useEffect, useState } from "react"

import { Tab, Tabs } from "@nextui-org/react"

import { useDynamicStore } from "@/stores"

import AiChatbot from "./aiChat/AiChatbot"
import SocialChat from "./socialChat/SocialChat"
import StreamChatPopup from "./StreamChat"

interface ChatPopupProps {
	isChatOpen: boolean
	onClose: () => void
}

type TabKey = "ai" | "dm" | "project" | "social"

export default function ChatPopup({ isChatOpen, onClose }: ChatPopupProps) {
	const [selectedTab, setSelectedTab] = useState<TabKey>("ai")

	useEffect(() => {
		if (useDynamicStore.getState().ChatPop?.open) {
			if (useDynamicStore.getState().ChatPop?.key) {
				setSelectedTab(useDynamicStore.getState().ChatPop?.key as TabKey)
			} else {
				setSelectedTab("project")
			}
		}
	}, [onClose])

	if (!isChatOpen) return null

	const renderTabContent = (key: TabKey) => {
		switch (key) {
			case "dm":
				return <StreamChatPopup type="messaging" />
			case "project":
				return <StreamChatPopup type="projects" />
			case "ai":
				return <AiChatbot />
			case "social":
				return <SocialChat />
			default:
				return null
		}
	}

	return (
		<div className="fixed bottom-0 right-8 max-w-[692px] w-full h-[660px] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.2),0_8px_24px_rgba(0,0,0,0.1)] z-50 flex flex-col overflow-hidden border-4 border-gradient-to-br from-gray-700 via-green-700 to-blue-700">
			<div className="w-full flex justify-between items-center p-2 border-b">
				<Tabs
					aria-label="Chat options"
					className="w-full"
					selectedKey={selectedTab}
					onSelectionChange={(key) => setSelectedTab(key as TabKey)}
					variant="light"
					classNames={{
						tabList: "w-full gap-0",
						tab: "w-1/4 h-10 flex-grow",
						tabContent:
							"text-center w-full group-data-[selected=true]:text-white",
						cursor: "!bg-gradient-to-b from-[#1DB954] to-[#0D5326] "
					}}
				>
					<Tab key="ai" title="Piper AI" />
					<Tab key="dm" title="DM" />
					<Tab key="project" title="Project" />
					<Tab key="social" title="Social" />
				</Tabs>
				<button
					onClick={onClose}
					className="w-10 p-2 hover:bg-gray-100 rounded-full"
				>
					✕
				</button>
			</div>
			<div className="h-[586px] flex chatPopup">
				{renderTabContent(selectedTab)}
			</div>
		</div>
	)
}
