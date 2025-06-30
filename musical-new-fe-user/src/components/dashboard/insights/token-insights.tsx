import React from "react"
import Image from "next/image"

import { fetchUserNftStats } from "@/app/api/query"
import { Card, CardBody, Skeleton } from "@nextui-org/react"
import { useQuery } from "@tanstack/react-query"

import { tokenTab } from "@/config"

export function TokenInsights() {
	const { data: userNftStats, isFetching } = useQuery({
		queryKey: ["userNftStats"],
		queryFn: fetchUserNftStats,
		staleTime: 1000 * 60 * 60 * 24
	})

	return (
		<div className="w-full">
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{tokenTab.map((token, index) => {
					return (
						<Card
							key={index}
							className="shadow-none border bg-[#FCFCFC] rounded-xl"
						>
							<CardBody className="p-4">
								<div className="flex items-start justify-between">
									<div className="flex flex-col items-start gap-3">
										<div className={`rounded-full p-2 ${token.iconBgColor}`}>
											<Image
												src={token.icon}
												alt={token.label}
												width={30}
												height={24}
											/>
										</div>
										<p className="text-sm font-bold text-textPrimary flex flex-col gap-1">
											{token.label}
											{token.secondaryLabel && (
												<span className="text-xs text-textGray">
													{token.secondaryLabel}
												</span>
											)}
										</p>
									</div>
									{isFetching ? (
										<Skeleton className="w-16 h-8 rounded-lg mt-2" />
									) : (
										<p className="text-2xl mt-2 font-bold text-[#111111] leading-none">
											{token.key !== "nftsUsdValue"
												? userNftStats?.[token.key]
												: userNftStats?.[token.key]?.toFixed(2)}
										</p>
									)}
								</div>
							</CardBody>
						</Card>
					)
				})}
			</div>
		</div>
	)
}
