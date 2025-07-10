import React from "react"
import Image from "next/image"

import { fetchAudienceInsights } from "@/app/api/query"
import CustomDonutChart from "@/components/chats/donutChart"
import { Title } from "@/components/ui"
import { formatNumber } from "@/helpers"
import { Card, CardBody, Skeleton } from "@nextui-org/react"
import { useQuery } from "@tanstack/react-query"
import { ArrowDown, ArrowUp } from "lucide-react"

import { audienceData } from "@/config/audience"

const donutChartColors = ["#2A85FF", "#CABDFF"]

export function AudienceInsights() {
	const { data: audienceInsights, isFetching } = useQuery({
		queryKey: ["audienceInsights"],
		queryFn: fetchAudienceInsights,
		staleTime: 1000 * 60 * 60 * 24
	})

	const socialAudienceData = audienceInsights?.socialAudienceData || []
	const socialAudienceStats = audienceInsights?.socialAudienceStats

	// Transform the data for the donut chart
	const donutChartData = socialAudienceData?.map(
		(item: { code: string; weight: number }) => ({
			name: item.code
				? item.code.charAt(0).toUpperCase() + item.code.slice(1)
				: "Unknown",
			value: item.weight || 0
		})
	)

	// Determine if difference is positive or negative
	const isPositive = audienceInsights?.fanMetrics?.monthlyDiffPercentage > 0

	const isZero = audienceInsights?.fanMetrics?.monthlyDiffPercentage === 0

	// Get the percentage value directly
	const percentChange =
		audienceInsights?.fanMetrics?.monthlyDiffPercentage?.toFixed(1)

	return (
		<div className="space-y-6">
			<Card className="border p-4 rounded-lg border-customGray">
				<div className="flex gap-2">
					<div className="w-1/3">
						<span className="flex items-center gap-1">
							<Title title="Fan Metrics" color="#FFD88D" />
						</span>
						<div className="flex flex-col gap-8">
							{audienceData.map((item, index) => (
								<Card
									key={index}
									className="shadow-none border bg-[#FCFCFC] rounded-xl max-w-[450px]"
								>
									<CardBody className="p-4">
										<div className="flex items-start justify-between">
											<div className="flex flex-col items-start gap-3">
												<div className={`rounded-full p-2 ${item.iconBgColor}`}>
													<Image
														src={item.icon}
														alt={item.label}
														width={30}
														height={24}
													/>
												</div>
												<p className="text-sm font-bold text-textPrimary">
													{item.label}
												</p>
											</div>
											{isFetching ? (
												<Skeleton className="w-16 h-8 rounded-lg mt-2" />
											) : (
												<div className="flex flex-col items-end gap-2">
													<p
														className={`text-2xl mt-2 font-bold ${audienceInsights?.fanMetrics?.value === undefined || audienceInsights?.fanMetrics?.value === 0 ? "text-textGray" : "text-[#111111]"} leading-none`}
													>
														{audienceInsights?.fanMetrics?.value ===
															undefined ||
														audienceInsights?.fanMetrics?.value === 0
															? "N/A"
															: formatNumber(
																	Number(audienceInsights?.fanMetrics?.value)
																)}
													</p>
													{!isZero && (
														<div className="flex items-center gap-1">
															{isPositive ? (
																<ArrowUp className="w-4 h-4 text-green-500" />
															) : (
																<ArrowDown className="w-4 h-4 text-red-500" />
															)}
															<span
																className={
																	isPositive
																		? "text-green-500 text-sm"
																		: "text-red-500 text-sm"
																}
															>
																{Math.abs(parseFloat(percentChange))}%
															</span>
														</div>
													)}
												</div>
											)}
										</div>
									</CardBody>
								</Card>
							))}
						</div>
					</div>
					<div className="w-1/3">
						<span className="flex items-center gap-1">
							<Title title="Social Audience Stats" color="#FFD88D" />
						</span>
						<div className="flex flex-col gap-8">
							{[
								"Followers",
								"Avg Likes/Post",
								"Avg Comments/Post",
								"Engagement Rate"
							].map((label, idx) => (
								<div
									key={idx}
									className="flex justify-between border-b py-2 text-sm font-medium"
								>
									<span>{label}</span>
									{isFetching ? (
										<Skeleton className="w-20 h-42 rounded-full" />
									) : (
										<span>
											{label === "Followers"
												? socialAudienceStats?.followers !== undefined
													? formatNumber(
															socialAudienceStats?.followers
														).toLocaleString()
													: "N/A"
												: label === "Avg Likes/Post"
													? socialAudienceStats?.avgLikesPerPost !== undefined
														? formatNumber(
																socialAudienceStats?.avgLikesPerPost
															).toLocaleString()
														: "N/A"
													: label === "Avg Comments/Post"
														? socialAudienceStats?.avgCommentsPerPost !==
															undefined
															? formatNumber(
																	socialAudienceStats?.avgCommentsPerPost
																).toLocaleString()
															: "N/A"
														: socialAudienceStats?.engagementRate !== undefined
															? `${socialAudienceStats?.engagementRate}%`
															: "N/A"}
										</span>
									)}
								</div>
							))}
						</div>
					</div>
					<div className="w-1/3">
						<span className="flex items-center gap-1">
							<Title title="Social Audience Data" color="#FFD88D" />
						</span>
						{isFetching ? (
							<Skeleton className="w-[250px] h-[250px] rounded-full justify-self-center" />
						) : (
							<CustomDonutChart
								data={
									donutChartData.length === 0
										? [{ name: "No data available", value: 1 }]
										: donutChartData
								}
								color={
									donutChartData.length === 0 ? ["#A0AEC0"] : donutChartColors
								}
								isLegend
							/>
						)}
					</div>
				</div>
			</Card>
		</div>
	)
}
