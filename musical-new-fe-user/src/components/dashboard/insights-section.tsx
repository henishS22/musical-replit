"use client"

import React from "react"

import { Tab, Tabs } from "@nextui-org/react"

import { AudienceInsights } from "./insights/audience-insights"
import { CampaignInsights } from "./insights/campaign-insights"
import { ReleaseInsights } from "./insights/release-insight"
import { TokenInsights } from "./insights/token-insights"

type TabItem = {
	key: string
	title: string
	component: React.ComponentType
}

const tabItems: TabItem[] = [
	{ key: "tokens", title: "Tokens", component: TokenInsights },
	{ key: "releases", title: "Releases", component: ReleaseInsights },
	{ key: "campaigns", title: "Campaigns", component: CampaignInsights },
	{ key: "audience", title: "Audience", component: AudienceInsights }
]

export function InsightsSection() {
	const [selected, setSelected] = React.useState<string>("tokens")

	return (
		<div className="space-y-2">
			<Tabs
				selectedKey={selected}
				onSelectionChange={(key) => setSelected(key.toString())}
				variant="solid"
				size="lg"
				radius="lg"
				classNames={{
					tabList: "gap-1 overflow-hidden",
					tab: "px-4 h-10 data-[selected=true]:bg-customGray data-[selected=true]:text-black data-[selected=true]:font-semibold bg-[#FCFCFC] text-textGray rounded-lg",
					cursor: "hidden"
				}}
				items={tabItems}
			>
				{(item) => (
					<Tab key={item.key} title={item.title}>
						<item.component />
					</Tab>
				)}
			</Tabs>
		</div>
	)
}
