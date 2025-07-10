import {
	Avatar,
	Pagination,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow
} from "@nextui-org/react"

type LeaderboardEntry = {
	totalPoints: number
	totalOccurrence: number
	userId: string
	username: string
	email: string
	profile_img: string
	rank: number
	isCurrentUser: boolean
}

interface LeaderboardTableProps {
	users: LeaderboardEntry[]
	currentPage: number
	totalPages: number
	onPageChange: (page: number) => void
}

const LeaderboardTable = ({
	users,
	currentPage,
	totalPages,
	onPageChange
}: LeaderboardTableProps) => {
	return (
		<div>
			<Table
				isStriped
				removeWrapper
				aria-label="Leaderboard table"
				className="mt-4 p-4  border border-videoBtnGreen rounded-xl"
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
					{users.map((user) => {
						const missions = user.totalOccurrence || 0
						return (
							<TableRow
								key={user.rank}
								className={
									user.isCurrentUser
										? "bg-videoBtnGreen border border-[#1DB954] rounded-lg text-[#1DB954]"
										: "font-bold text-sm leading-[150%] tracking-[0px] text-[#4F4F4F]"
								}
							>
								<TableCell>{user.rank}</TableCell>
								<TableCell className="flex items-center gap-2">
									<Avatar
										src={user.profile_img}
										className="w-8 h-8"
										fallback={
											<div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600 text-lg font-semibold">
												{user.username.charAt(0)}
											</div>
										}
									/>
									<span>{user.username}</span>
								</TableCell>
								<TableCell>{user.email}</TableCell>
								<TableCell>{missions}</TableCell>
								<TableCell>{user.totalPoints}</TableCell>
							</TableRow>
						)
					})}
				</TableBody>
			</Table>
			<div className="flex justify-end mt-4">
				<Pagination
					total={totalPages}
					page={currentPage}
					onChange={onPageChange}
					showControls
					variant="light"
				/>
			</div>
		</div>
	)
}

export default LeaderboardTable
