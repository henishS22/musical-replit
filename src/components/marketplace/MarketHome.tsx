"use client"

import React from "react"

import {
	fetchExchangeNfts,
	fetchNfts,
	fetchPublicProjects
} from "@/app/api/query"
import MadeNFTSection from "@/components/profile/tokenTab/MadeNftSection"
import { generateQueryParams } from "@/helpers"
import { IUser } from "@/types/apiResponse"
import { useQuery } from "@tanstack/react-query"

import { useUserStore } from "@/stores"

import ExchangeNFTSection from "../profile/tokenTab/ExchangeNFTSection"
import GuildedNFT from "./GuildedNFT"
import LatestCreators from "./LatestCreators"
import LatestMissions from "./quest/LatestMissions"

interface MarketHomeProps {
	onViewAll: (section: string) => void
}

const MarketHome: React.FC<MarketHomeProps> = ({ onViewAll }) => {
	const { user } = useUserStore()

	const url = generateQueryParams({
		offset: 0,
		limit: "10",
		includeUsdPrices: true
	})
	const { data, isPending, isFetching } = useQuery({
		queryKey: ["nftListing"],
		queryFn: () => fetchNfts(url)
		// enabled: !!user?.id
	})

	const {
		data: exchangeNfts,
		isPending: isExchangeNftsPending,
		isFetching: isExchangeNftsFetching
	} = useQuery({
		queryKey: ["exchangeNfts"],
		queryFn: () =>
			fetchExchangeNfts(
				generateQueryParams({
					page: 1,
					limit: "10"
				})
			),
		enabled: !!user?.id
	})

	const {
		data: publicProjects,
		isPending: isPublicProjectsPending,
		isFetching: isPublicProjectsFetching
	} = useQuery({
		queryKey: ["publicProjects"],
		queryFn: () => fetchPublicProjects(),
		enabled: !!user?.id
	})

	return (
		<>
			<LatestCreators onViewAll={onViewAll} />

			<MadeNFTSection
				heading="Trending Spaces"
				classNames={{
					heading:
						"!font-semibold !text-[20px] !leading-[32px] !tracking-[-0.02em] text-textPrimary"
				}}
				onViewAll={() => onViewAll("Trending Spaces")}
				nftData={data?.data && data?.data?.length > 0 ? data?.data : []}
				loading={isPending || isFetching}
				viewMode="grid"
				basePath={`/buy-nft`}
				showViewAll={data && data?.data?.length > 0 ? true : false}
			/>

			{user && (
				<>
					<div className="flex flex-col">
						<GuildedNFT onViewAll={() => onViewAll("Guild Passes")} />
					</div>

					<ExchangeNFTSection
						isMarketplace
						heading="Exchange Tokens"
						classNames={{
							heading:
								"!font-semibold !text-[20px] !leading-[32px] !tracking-[-0.02em] text-textPrimary"
						}}
						onViewAll={() => onViewAll("Exchange NFTs")}
						nftData={
							exchangeNfts && exchangeNfts?.nfts?.length > 0
								? exchangeNfts?.nfts.slice(0, 4)
								: []
						}
						loading={isExchangeNftsPending || isExchangeNftsFetching}
						basePath={`/exchange-nft`}
						showViewAll={
							exchangeNfts && exchangeNfts?.nfts?.length > 4 ? true : false
						}
					/>

					<LatestMissions
						showAll={false}
						onViewAll={() => onViewAll("Latest Missions")}
					/>

					<MadeNFTSection
						heading="Featured Projects"
						classNames={{
							heading:
								"!font-semibold !text-[20px] !leading-[32px] !tracking-[-0.02em] text-textPrimary"
						}}
						onViewAll={() => onViewAll("Featured Projects")}
						basePath={`/project`}
						viewMode="grid"
						nftData={
							publicProjects && publicProjects?.length > 0
								? publicProjects.map(
										(item: {
											artworkUrl: string
											name: string
											_id: string
											user: IUser
										}) => ({
											artworkUrl: item?.artworkUrl,
											title: item?.name,
											_id: item?._id,
											user: item?.user
										})
									)
								: []
						}
						loading={isPublicProjectsPending || isPublicProjectsFetching}
						showViewAll={
							publicProjects && publicProjects?.length > 0 ? true : false
						}
					/>
				</>
			)}
		</>
	)
}

export default MarketHome