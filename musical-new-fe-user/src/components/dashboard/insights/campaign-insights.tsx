import React from "react"
import { useRouter } from "next/navigation"

import { fetchCampaignInsights } from "@/app/api/query"
import { Button, Skeleton } from "@nextui-org/react"
import { useQuery } from "@tanstack/react-query"

import { campaignData } from "@/config"
import { useUserStore } from "@/stores"

import { MetricCard } from "./metric-card"

export function CampaignInsights() {
	const { subscriptionFeatures } = useUserStore()
	const router = useRouter()
	const isSubscribed = subscriptionFeatures?.[8]?.available

	const { data: campaignInsights, isFetching } = useQuery({
		queryKey: ["campaignInsights"],
		queryFn: fetchCampaignInsights,
		staleTime: 1000 * 60 * 60 * 24,
		enabled: isSubscribed
	})

	return (
		<div className="space-y-4">
			<div
				className={`grid grid-cols-1 gap-6 ${!isFetching ? (!isSubscribed ? "md:grid-cols-1" : "md:grid-cols-2") : "md:grid-cols-1"}`}
			>
				{isFetching ? (
					<div className={`grid grid-cols-1 gap-6 md:grid-cols-2`}>
						<Skeleton className="rounded-xl h-[246px]" />
						<Skeleton className="rounded-xl h-[246px]" />
					</div>
				) : !isSubscribed ? (
					<div className="text-center text-sm text-gray-500 h-[246px] flex flex-col gap-2 items-center justify-center">
						<span>
							Social Management Suite is not available in your current plan.
							Please upgrade your plan to access this feature.
						</span>
						<Button
							className="h-10 px-2 text-sm text-black font-semibold bg-[#FCFCFC] border-2 border-customGray hover:bg-gray-100 rounded-lg py-2.5 me-2 mb-2"
							onPress={() => router.push("subscription")}
						>
							Upgrade Plan
						</Button>
					</div>
				) : (
					campaignData.map((data, index) => (
						<MetricCard
							key={index}
							data={campaignInsights as Record<string, string>}
							title={data.title}
							subtitle={data.subtitle}
							metrics={data.metrics}
							icon={data.icon}
							iconColor={data.iconColor}
							iconBgColor={data.iconBgColor}
							isDemo={data.title === "Paid"}
						/>
					))
				)}
			</div>
		</div>
	)
}
