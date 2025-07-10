"use client"

import React, { useMemo, useState } from "react"

import { fetchOpportunityList, fetchSavedSongContestIds } from "@/app/api/query"
import { INVITE_COLLABORATOR_MODAL } from "@/constant/modalType"
import { generateQueryParams } from "@/helpers"
import { Filter } from "@/types/opportunity"
import { Button, Skeleton } from "@nextui-org/react"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"

import { useDynamicStore, useModalStore, useUserStore } from "@/stores"
import { useDebounce } from "@/hooks/useDebounce"

import { ApplyForOpportunityModal } from "../modal"
import PostOpportunityModal from "../modal/postOpportunity"
import { NoDataFound } from "../ui"
import { FilterSection } from "./FIlterSection"
import { OpportunityCard } from "./OpportunityCard"
import { SearchBar } from "./SearchBar"
import TabButton from "./TabButton"

export default function Opportunity() {
	const { user } = useUserStore()
	const { removeState } = useDynamicStore()
	const { showCustomModal, hideCustomModal } = useModalStore()
	const [filter, setFilter] = useState<Filter>({
		seeking: [],
		style: [],
		languages: [],
		collaborateWith: "ARTISTS"
	})

	const [txtFilter, setTxtFilter] = useState("")

	const [activeTab, setActiveTab] = useState("recent")

	const debouncedTxtFilter = useDebounce(txtFilter || "", 1000)
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } =
		useInfiniteQuery({
			queryKey: ["opportunityList", activeTab, debouncedTxtFilter, filter],
			initialPageParam: 0,
			queryFn: (pageParam) =>
				fetchOpportunityList(
					user?.id as string,
					generateQueryParams({
						selectedTabFilter: activeTab,
						offSet: pageParam?.pageParam || 0,
						seeking: filter.seeking.join(","),
						style: filter.style.join(","),
						languages: filter.languages.join(","),
						collaborateWith: filter.collaborateWith,
						txtFilter: debouncedTxtFilter
					})
				),
			getNextPageParam: (lastPage, allPages) => {
				const totalItems = lastPage?.total || 0
				const currentPage = allPages?.length
				return currentPage * 10 < totalItems ? currentPage + 1 : undefined // Assuming 10 items per page
			},
			staleTime: 300000,
			enabled: Boolean(user?.id)
		})

	const { data: savedOpportunities } = useQuery({
		queryKey: ["savedOpportunities"],
		queryFn: fetchSavedSongContestIds,
		staleTime: 300000
	})

	const opportunities = useMemo(() => {
		return data?.pages.flatMap((page) => page?.result ?? []) || [] // Flattening all pages
	}, [data])

	return (
		<div className="flex relative flex-col items-start mt-[14px]">
			<div className="flex z-0 flex-wrap gap-10 justify-between items-center self-stretch w-full font-bold min-h-[43px] max-md:max-w-full">
				<div className="flex gap-4 items-center self-stretch my-auto text-xl tracking-normal leading-tight text-zinc-900">
					<div className="flex shrink-0 self-stretch my-auto w-4 h-8 bg-amber-200 rounded" />
					<div className="self-stretch my-auto">Collab Opportunities</div>
				</div>
				<Button
					className="flex gap-4 items-center self-stretch my-auto px-4 py-2 text-base tracking-normal leading-relaxed text-white bg-[#8A8A8A] rounded-xl border-2 border-solid border-zinc-100"
					onPress={() => {
						removeState("trackId")
						removeState("CreateOpportunity")
						showCustomModal({
							customModalType: INVITE_COLLABORATOR_MODAL,
							tempCustomModalData: {
								initialKey: "opportunity",
								onBack: () => {
									hideCustomModal()
								}
							}
						})
					}}
				>
					Post Opportunity +
				</Button>
			</div>
			<SearchBar
				placeholder="Search"
				className="mt-7 w-full"
				onChange={(e) => setTxtFilter(e.target.value)}
			/>
			<div className="flex z-0 gap-2 items-start mt-7 text-base font-medium tracking-normal leading-relaxed text-gray-500 min-w-[240px]">
				<TabButton activeTab={activeTab} setActiveTab={setActiveTab} />
			</div>
			<div className="flex flex-wrap gap-6 mt-7 w-full">
				<div className="flex-[60%_1_1]">
					{opportunities.length > 0 ? (
						opportunities.map((opportunity) => (
							<OpportunityCard
								key={opportunity._id}
								author={{
									_id: opportunity?.user?._id,
									name: opportunity?.user?.name,
									avatar: opportunity?.user?.profile_img || ""
								}}
								title={opportunity.title}
								description={opportunity.brief}
								skills={opportunity.seeking}
								date={opportunity.createdAt}
								id={opportunity._id}
								isSaved={savedOpportunities?.includes(opportunity._id) || false}
								projectId={opportunity.projectId}
							/>
						))
					) : isPending ? (
						<div className="w-full space-y-4">
							{Array.from({ length: 3 }).map((_, index) => (
								<Skeleton key={index} className="w-full h-[139px] rounded-lg" />
							))}
						</div>
					) : (
						<NoDataFound message="No opportunities found" />
					)}
					{hasNextPage && (
						<Button
							className="w-full px-4 py-2 mt-4 text-sm font-bold tracking-normal leading-6 text-green-900 bg-white rounded-lg border border-solid border-zinc-100"
							onPress={() => {
								if (hasNextPage && !isFetchingNextPage) {
									fetchNextPage()
								}
							}}
							isDisabled={!hasNextPage || isFetchingNextPage}
							isLoading={isFetchingNextPage}
						>
							Load More..
						</Button>
					)}
				</div>
				<FilterSection setFilter={setFilter} filter={filter} />
			</div>
			<PostOpportunityModal savedOpportunities={savedOpportunities || []} />
			<ApplyForOpportunityModal />
		</div>
	)
}
