"use client"

import * as React from "react"

import { fetchPublishableQuest } from "@/app/api/query"
import { NoDataFound } from "@/components/ui"
import { Quest } from "@/types/missionTypes"
import { useQuery } from "@tanstack/react-query"

import { SocialIcons } from "../socialIcons"
import { MissionCard } from "./MissionCard"
import MissionCardSeketon from "./MissionCardSeketon"

export default function MissionsWidget() {
	const { data, isFetching } = useQuery({
		queryKey: ["new"],
		queryFn: fetchPublishableQuest,
		staleTime: 1000 * 60 * 60 * 24
	})

	return (
		<div className="flex flex-col gap-6 mt-6">
			{isFetching ? (
				<MissionCardSeketon />
			) : data && data?.length > 0 ? (
				data.map((item: Quest) => (
					<MissionCard
						key={item?._id}
						icon={SocialIcons[item.identifier as keyof typeof SocialIcons]}
						title={item.name}
						points={item.points}
						description={item?.description as string}
						_id={item._id}
						identifier={item?.identifier}
						isAvailable={item?.isAvailable as boolean}
					/>
				))
			) : (
				<NoDataFound />
			)}
		</div>
	)
}
