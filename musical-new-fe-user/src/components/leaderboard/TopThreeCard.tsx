import Image from "next/image"

import { CROWN_ICON } from "@/assets"
import { Avatar } from "@nextui-org/react"

type LeaderboardEntry = {
	totalPoints: number
	totalOccurrence: number
	userId: string
	username: string
	email: string
	profile_img: string
}

interface TopThreeCardProps {
	user: LeaderboardEntry
	rank: number
}

const TopThreeCard = ({ user, rank: userRank }: TopThreeCardProps) => {
	const missions = user.totalOccurrence
	const rank = userRank
	const name = user?.username
	const email = user?.email
	const avatar = user?.profile_img

	const cardBase = "relative flex flex-col items-center px-4 py-6 rounded-xl"

	const cardStyles =
		rank === 1
			? "!py-10 bg-[#FFD61F4D] min-h-[312px] before:absolute before:inset-0 before:rounded-lg before:border-[3.75px] before:border-transparent before:bg-gradient-to-b before:from-[#FFEF09] before:to-[#DAA90A] before:z-[-1]"
			: rank === 2
				? "bg-[#E6E6E6] min-h-[250px] before:absolute before:inset-0 before:rounded-lg before:border-[3px] before:border-transparent before:bg-gradient-to-b before:from-[#E6E6E6] before:to-[#808080] before:z-[-1]"
				: "bg-[#F0B3644D] min-h-[220px] before:absolute before:inset-0 before:rounded-lg before:border-[3px] before:border-transparent before:bg-gradient-to-b before:from-[#F0B364] before:to-[#8A673A] before:z-[-1]"

	const nameStyle =
		rank === 1
			? "text-[18px] font-bold leading-[150%] text-center font-[Plus Jakarta Sans]"
			: "text-[14.4px] font-bold leading-[150%] text-center font-[Plus Jakarta Sans]"

	const rankBg =
		rank === 1
			? "bg-[linear-gradient(180deg,#FFEF09_0%,#DAA90A_83.41%)]"
			: rank === 2
				? "bg-[linear-gradient(180deg,#E6E6E6_0%,#808080_100%)]"
				: "bg-[linear-gradient(180deg,#F0B364_0%,#8A673A_100%)]"

	const avatarWrapper =
		rank === 1
			? "avatar-border-gold"
			: rank === 2
				? "avatar-border-silver"
				: "avatar-border-bronze"

	return (
		<div className={`${cardBase} ${cardStyles}`}>
			<div className={`relative inline-block ${avatarWrapper} mb-4`}>
				<Avatar
					src={avatar || ""}
					className={`${rank === 1 ? "w-[107px] h-[107px]" : "w-20 h-20"} relative p-[3px]`}
					fallback={
						<div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600 text-lg font-semibold">
							{name?.charAt(0)}
						</div>
					}
				/>
				<div
					className={`${rankBg} absolute bottom-[-21px] left-1/2 transform -translate-x-1/2 rounded-full ${rank === 1 ? "w-9 h-9 text-[20px]" : "w-8 h-8 text-base"} flex items-center justify-center text-black font-bold`}
				>
					{rank}
				</div>
				{rank === 1 && (
					<div className="absolute top-[-23px] left-1/2 transform -translate-x-1/2 flex items-center justify-center text-black font-bold">
						<Image src={CROWN_ICON} alt="crown" />
					</div>
				)}
			</div>
			<h3 className={`${nameStyle} mt-4`}>{name}</h3>
			<p className={`${nameStyle}  !text-[#7A7A7A]`}>{email}</p>
			<p className={`${nameStyle}`}>{missions} Missions</p>
			<p className="text-sm">{user.totalPoints} pts</p>
		</div>
	)
}

export default TopThreeCard
