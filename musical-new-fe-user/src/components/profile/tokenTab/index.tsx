"use client"

import { fetchNftsByUser } from "@/app/api/query"
import { TokenInsights } from "@/components/dashboard/insights/token-insights"
import { useQuery } from "@tanstack/react-query"

import { useUserStore } from "@/stores"

import MadeNFTSection from "./MadeNftSection"

const TokenTab: React.FC = () => {
	const { userData } = useUserStore()

	const { data: nftsByUser, isFetching } = useQuery({
		queryKey: ["nftsByUser"],
		queryFn: fetchNftsByUser,
		staleTime: 1000 * 60 * 60 * 24,
		enabled: !!userData?._id
	})

	return (
		<div className="flex flex-col gap-10 mt-6">
			<div className="flex flex-col gap-10">
				<div className="self-stretch my-auto text-xl font-bold tracking-normal leading-tight text-zinc-900">
					Insights
				</div>
				<TokenInsights />
			</div>
			<MadeNFTSection
				heading="Made Tokens"
				nftData={nftsByUser?.tokensCreatedByWallet}
				loading={isFetching}
				viewMode="slider"
				basePath="/exchange-nft"
			/>
			<MadeNFTSection
				heading="Owned Tokens"
				nftData={nftsByUser?.tokensPurchasedByWallet}
				loading={isFetching}
				viewMode="slider"
				basePath="/exchange-nft"
			/>
		</div>
	)
}

export default TokenTab
