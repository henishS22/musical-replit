import React from "react"
import Image from "next/image"

import { fetchReleaseInsights } from "@/app/api/query"
import { formatNumber } from "@/helpers"
import { Card, CardBody, Skeleton } from "@nextui-org/react"
import { useQuery } from "@tanstack/react-query"

import { releaseData } from "@/config"

export function ReleaseInsights() {
	const { data: releaseInsights, isFetching } = useQuery({
		queryKey: ["releaseInsights"],
		queryFn: fetchReleaseInsights,
		staleTime: 1000 * 60 * 60 * 24
	})

	return (
		<div className="w-full">
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{releaseData.map((item, index) => (
					<Card
						key={index}
						className="shadow-none border bg-[#FCFCFC] rounded-xl"
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
									<div className="flex flex-col items-end gap-1">
										<p
											className={`text-2xl mt-2 font-bold text-[#111111] leading-none ${releaseInsights?.[item?.key] === 0 ? "!text-textGray" : ""}`}
										>
											{releaseInsights?.[item?.key] === 0
												? "N/A"
												: formatNumber(
														Number(releaseInsights?.[item?.key] || 0)
													)}
										</p>
									</div>
								)}
							</div>
						</CardBody>
					</Card>
				))}
			</div>
		</div>
	)
}
