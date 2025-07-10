"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { fetchCreatorLeaderboard, LeaderboardItem } from "@/app/api/query"
import { Skeleton } from "@nextui-org/react"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft } from "lucide-react"

import { useUserStore } from "@/stores"

import LeaderboardSkeleton from "../skeletons/LeaderboardSkeleton"
import { Title } from "../ui"
import LeaderboardTable from "./LeaderboardTable "
import TopThreeCard from "./TopThreeCard"

const Leaderboard = () => {
	const [page, setPage] = useState(1)
	const limit = 10
	const { userData } = useUserStore()
	const router = useRouter()

	// Fetch Top 3 users once - fixed at page 1, limit 3
	const { data: topThreeData, isLoading: loadingTopThree } = useQuery({
		queryKey: ["topThree"],
		queryFn: () => fetchCreatorLeaderboard({ page: 1, limit: 3 })
	})

	// Fetch paged leaderboard data
	const { data, isLoading } = useQuery({
		queryKey: ["leaderboard", page],
		queryFn: () => fetchCreatorLeaderboard({ page, limit })
		// keepPreviousData: true,
	})

	// On first page, skip the first 3 users that appear in topThree
	const tableUsers =
		data?.data?.length && page === 1
			? data?.data?.slice(3) || []
			: data?.data || []

	// Assign rank starting from 4 for first page after skipping top 3, else from proper offset
	const others = tableUsers.map((item: LeaderboardItem, i: number) => ({
		...item,
		rank: page === 1 ? i + 4 : (page - 1) * limit + i + 1,
		isCurrentUser: item.email === userData?.email
	}))

	const topThree = topThreeData?.data || []

	return (
		<div className="p-6 bg-white rounded-xl flex flex-col gap-6">
			<div className="flex items-center mb-4 gap-3">
				<span
					className="py-2 px-4 border-customGray border-2 rounded-lg cursor-pointer"
					onClick={() => router.back()}
				>
					<ArrowLeft />
				</span>
				<Title title="Leaderboard" color="#8A8A8A" titleClassName="!mb-0" />
			</div>

			{loadingTopThree ? (
				// Skeleton loader for top three
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-[37px] justify-center items-end py-6 px-[34px] border border-videoBtnGreen rounded-xl">
					{Array.from({ length: 3 }).map((_, idx) => (
						<div key={idx} className="">
							<Skeleton className="rounded-xl h-[246px]" />
						</div>
					))}
				</div>
			) : topThree.length > 0 ? (
				<>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-[37px] justify-center items-end py-6 px-[34px] border border-videoBtnGreen rounded-xl">
						{topThree[1] && <TopThreeCard user={topThree[1]} rank={2} />}
						{topThree[0] && <TopThreeCard user={topThree[0]} rank={1} />}
						{topThree[2] && <TopThreeCard user={topThree[2]} rank={3} />}
						{/* </> */}
					</div>

					{!isLoading ? (
						others.length > 0 ? (
							<LeaderboardTable
								users={others}
								currentPage={page}
								totalPages={data?.totalPages || 10}
								onPageChange={setPage}
							/>
						) : (
							<div className="text-center text-gray-500 text-lg mt-4">
								No other users on the leaderboard.
							</div>
						)
					) : (
						<LeaderboardSkeleton />
					)}
				</>
			) : (
				// Empty state for top three
				<div className="sm:col-span-3 text-center text-gray-500 text-lg">
					No users on the leaderboard yet.
				</div>
			)}
		</div>
	)
}

export default Leaderboard
