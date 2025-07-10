"use client"

import { fetchPlatformQuest, fetchPublishableQuest } from "@/app/api/query"
import { Quest } from "@/types/missionTypes"
import { Skeleton, Tab, Tabs } from "@nextui-org/react"
import { useQuery } from "@tanstack/react-query"

import CardsSection from "./CardsSection"

type TabItem = {
	key: "fan" | "creator"
	title: string
	loading: boolean
}

const MissionsSection = () => {
	const { data: creatorMission, isFetching: isCreatorLoading } = useQuery({
		queryKey: ["publishableQuest"],
		queryFn: fetchPublishableQuest,
		staleTime: 1000 * 60 * 60 * 24
	})
	const { data: fanMission, isFetching: isFanLoading } = useQuery({
		queryKey: ["platformQuest"],
		queryFn: fetchPlatformQuest,
		staleTime: 1000 * 60 * 60 * 24
	})

	const tabItems: TabItem[] = [
		{ key: "fan", title: "As a Fan", loading: isFanLoading },
		{ key: "creator", title: "As a Creator", loading: isCreatorLoading }
	]

	return (
		<Tabs
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
			{(item) => {
				const data = item.key === "fan" ? fanMission : creatorMission

				return (
					<Tab key={item.key} title={item.title}>
						{item.loading ? (
							<div className="grid [grid-template-columns:repeat(auto-fill,_minmax(509px,_1fr))] gap-4">
								{[1, 2, 3, 4].map((_, idx) => (
									<Skeleton className="rounded-xl h-[130px]" key={idx} />
								))}
							</div>
						) : (
							<CardsSection type={item.key} data={data as Quest[]} />
						)}
					</Tab>
				)
			}}
		</Tabs>
	)
}

export default MissionsSection
