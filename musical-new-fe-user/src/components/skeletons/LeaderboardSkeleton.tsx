import {
	Skeleton,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow
} from "@nextui-org/react"

const LeaderboardSkeleton = () => {
	const skeletonRows = Array.from({ length: 10 })

	return (
		<div>
			<Table
				isStriped
				removeWrapper
				aria-label="Leaderboard loading skeleton"
				className="mt-4 p-4 border border-videoBtnGreen rounded-xl"
				hideHeader
			>
				<TableHeader>
					<TableColumn>Rank</TableColumn>
					<TableColumn>User</TableColumn>
					<TableColumn>Quests</TableColumn>
					<TableColumn>Events</TableColumn>
					<TableColumn>Points</TableColumn>
				</TableHeader>
				<TableBody>
					{skeletonRows.map((_, idx) => (
						<TableRow key={idx}>
							<TableCell>
								<Skeleton className="h-4 w-6 rounded-md" />
							</TableCell>
							<TableCell>
								<div className="flex items-center gap-2">
									<Skeleton className="w-8 h-8 rounded-full" />
									<Skeleton className="h-4 w-24 rounded-md" />
								</div>
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-32 rounded-md" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-10 rounded-md" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-8 rounded-md" />
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	)
}

export default LeaderboardSkeleton
