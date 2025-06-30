import React from "react"
import Image, { StaticImageData } from "next/image"
import { useRouter } from "next/navigation"

import PointsBadge from "@/components/viewProfile/missions/PointsBadge"

interface MissionCardProps {
	iconUrl: string | StaticImageData
	title: string
	description: string
	userAvatarUrl: string
	userName: string
	date: string
	userId: string
	onClick: () => void
}

const MarketQuestCard: React.FC<MissionCardProps> = ({
	iconUrl,
	title,
	description,
	userAvatarUrl,
	userName,
	date,
	userId,
	onClick
}) => {
	const router = useRouter()

	const routeToProfile = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		e.preventDefault()
		e.stopPropagation()

		router.push(`/profile/${userId}`)
	}

	return (
		<div
			className="flex flex-col flex-1 shrink justify-center p-3 rounded-xl border border-solid basis-0 bg-zinc-50 border-zinc-300 min-w-60 w-full cursor-pointer"
			onClick={onClick}
		>
			<header className="flex flex-wrap gap-3 justify-between items-center w-full font-bold">
				<div className="flex gap-3">
					<Image
						src={iconUrl}
						alt={`${title} icon`}
						className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square rounded-[8px]"
						width={24}
						height={24}
					/>
					<h3 className="self-stretch my-auto text-base text-zinc-900">
						{title}
					</h3>
				</div>
				<PointsBadge points={10} />
			</header>

			<p className="mt-6 text-sm font-medium tracking-tight text-black line-clamp-4 h-[80px]">
				{description?.length &&
					description.split("#").map((part, index) => {
						if (index === 0) return part
						const hashtagPart = part.split(" ")[0]
						const rest = part.slice(hashtagPart.length)
						return (
							<React.Fragment key={index}>
								<span style={{ color: "rgba(0,122,255,1)" }}>
									#{hashtagPart}
								</span>
								<span className="line-clamp-4">{rest}</span>
							</React.Fragment>
						)
					})}
			</p>

			<footer className="flex justify-between items-end mt-6 w-full text-sm tracking-tight">
				<div
					className="flex gap-2 items-center font-semibold text-black"
					onClick={(e) => routeToProfile(e)}
				>
					<Image
						src={userAvatarUrl}
						alt={userName}
						className="object-contain self-stretch my-auto aspect-square rounded-[66px] w-[34px]"
						width={34}
						height={34}
					/>
					<span className="self-stretch my-auto">{userName}</span>
				</div>
				<div className="font-medium text-right text-neutral-400">{date}</div>
			</footer>
		</div>
	)
}

export default MarketQuestCard
