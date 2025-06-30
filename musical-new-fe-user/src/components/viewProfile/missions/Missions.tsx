"use client"

import * as React from "react"
import { useParams } from "next/navigation"

import { fetchCreatorQuest } from "@/app/api/query"
import { SocialIcons } from "@/components/missions/socialIcons"
import { NoDataFound } from "@/components/ui"
import { useQuery } from "@tanstack/react-query"
import moment from "moment"

import QuestSkeleton from "./QuestSkeleton"
import MissionCard from "./UserQuest"

export const Missions: React.FC = () => {
	const { id } = useParams()

	const { data, isFetching } = useQuery({
		queryKey: ["creatorQuest"],
		queryFn: () => fetchCreatorQuest(id as string),
		staleTime: 1000 * 60 * 60 * 24
	})

	return (
		<section className="text-sm mt-6">
			{isFetching ? (
				<QuestSkeleton />
			) : data && data?.length > 0 ? (
				data.map(
					(activity: {
						description: string
						createdAt: string
						_id: string
						questId: {
							name: string
							points: string
						}
						identifier: string
					}) => (
						<div key={data?._id}>
							<MissionCard
								type={activity?.questId?.name}
								timestamp={moment(activity?.createdAt).format(
									"DD MMM YY | HH:mm"
								)}
								points={activity?.questId?.points}
								message={activity?.description}
								iconUrl={
									SocialIcons[activity.identifier as keyof typeof SocialIcons]
								}
							/>
						</div>
					)
				)
			) : (
				<NoDataFound />
			)}
		</section>
	)
}

export default Missions
