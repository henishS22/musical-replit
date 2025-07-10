"use client"

import { Tab, Tabs } from "@nextui-org/react"
import { MessageCircleIcon, MicIcon } from "lucide-react"

import TabContent from "./TabContent"

export default function Community() {
	const tabs = [
		{
			id: "collab",
			label: "Collab Opportunities",
			icon: <MicIcon className="w-4 h-4" />
		},
		{
			id: "discussion",
			label: "Discussion",
			icon: <MessageCircleIcon className="w-4 h-4" />
		}
	]

	return (
		<div className="relative">
			{/* Main heading */}
			<h1 className="font-semibold text-[40px] leading-[48px] tracking-[-0.02em] mb-6">
				Community
			</h1>

			{/* White container */}
			<div className="bg-white rounded-xl p-6">
				{/* Tabs container */}
				<Tabs
					aria-label="Community tabs"
					className="w-full"
					color="primary"
					defaultSelectedKey="collab"
					classNames={{
						base: "w-full",
						tabList: "w-full gap-1 relative rounded-xl p-4 !bg-[#F4F4F4]",
						cursor:
							"w-full bg-white rounded-lg shadow-[0px_4px_8px_-4px_#00000040,0px_2px_0px_0px_#FFFFFF40_inset,0px_-1px_1px_0px_#0000000A_inset]",
						tab: "h-[48px] px-4 rounded-lg data-[selected=true]:!bg-white data-[selected=true]:font-inter data-[selected=true]:font-semibold font-semibold text-[15px] leading-[24px] tracking-[-0.01em]",
						tabContent: [
							"group-data-[selected=true]:text-zinc-900",
							"group-data-[selected=true]:font-inter",
							"group-data-[selected=true]:font-semibold",
							"group-data-[selected=true]:text-[15px]",
							"group-data-[selected=true]:leading-6",
							"group-data-[selected=true]:tracking-[-0.01em]",
							"group-data-[selected=false]:text-textGray",
							"group-data-[selected=false]:font-manrope",
							"group-data-[selected=false]:font-bold",
							"group-data-[selected=false]:text-[15px]",
							"group-data-[selected=false]:leading-6",
							"group-data-[selected=false]:tracking-[-0.01em]"
						].join(" ")
					}}
					variant="light"
				>
					{tabs.map((tab) => (
						<Tab
							key={tab.id}
							title={
								<div className="flex items-center gap-2">
									{tab.icon}
									<span>{tab.label}</span>
								</div>
							}
						>
							<TabContent type={tab.id as "collab" | "discussion"} />
						</Tab>
					))}
				</Tabs>
			</div>

			{/* Fixed Chat Popup Button */}
		</div>
	)
}
