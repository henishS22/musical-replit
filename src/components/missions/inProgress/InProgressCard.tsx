import React from "react"
import Image, { StaticImageData } from "next/image"

import PointsBadge from "@/components/viewProfile/missions/PointsBadge"
import { Button } from "@nextui-org/react"

interface InProgressCardProps {
	heading: string
	icon: string | StaticImageData
	date: string
	description: string
	isPublished: boolean
	onButtonClickHandler: () => void
	onCardClickHandler: () => void
}

const InProgressCard: React.FC<InProgressCardProps> = ({
	heading,
	icon,
	date,
	description,
	isPublished,
	onButtonClickHandler,
	onCardClickHandler
}) => {
	return (
		<article className="flex flex-col justify-center p-3 w-full rounded-xl border border-solid bg-zinc-50 border-zinc-100 max-md:max-w-full">
			<header className="flex flex-wrap gap-6 items-center w-full text-sm font-bold max-md:max-w-full">
				<Image
					src={icon}
					alt=""
					className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
					height={24}
					width={24}
				/>
				<h2
					className="flex-1 shrink self-stretch my-auto text-base basis-0 min-w-60 text-zinc-900 max-md:max-w-full cursor-pointer"
					onClick={onCardClickHandler}
				>
					{heading}
				</h2>
				<time className="self-stretch my-auto font-medium tracking-tight text-neutral-400">
					{date}
				</time>
				<PointsBadge points={10} />
			</header>
			<div className="flex flex-wrap mt-2 max-md:max-w-full justify-between md:flex-nowrap">
				<p className="text-sm font-medium tracking-tight text-black w-[873px] max-md:max-w-full">
					{description.split("#").map((part, index) => {
						if (index === 0) return part
						const hashtagPart = part.split(" ")[0]
						const rest = part.slice(hashtagPart.length)
						return (
							<React.Fragment key={index}>
								<span style={{ color: "rgba(0,122,255,1)" }}>
									#{hashtagPart}
								</span>
								{rest}
							</React.Fragment>
						)
					})}
				</p>

				<Button
					className="gap-2 self-stretch px-4 py-2 text-sm font-bold tracking-normal leading-6 text-green-500 whitespace-nowrap bg-green-100 rounded-lg h-10"
					onPress={onButtonClickHandler}
				>
					{isPublished ? "Unpublish" : "Re-start"}
				</Button>
			</div>
		</article>
	)
}

export default InProgressCard
