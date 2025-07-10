"use client"

import * as React from "react"
import Image, { StaticImageData } from "next/image"

import PointsBadge from "./PointsBadge"

interface MissionCardProps {
	type: string
	timestamp: string
	points: string
	message: string
	iconUrl: string | StaticImageData
}

const UserQuest: React.FC<MissionCardProps> = ({
	type,
	timestamp,
	points,
	message,
	iconUrl
}) => {
	return (
		<article className="flex flex-col justify-center p-3 w-full rounded-xl border border-solid bg-zinc-50 border-zinc-100 max-md:max-w-full">
			<header className="flex flex-wrap gap-6 items-center w-full font-bold max-md:max-w-full">
				<Image
					src={iconUrl}
					alt=""
					className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
					height={24}
					width={24}
				/>
				<h2 className="flex-1 shrink self-stretch my-auto text-base basis-0 min-w-60 text-zinc-900 max-md:max-w-full">
					{type}
				</h2>
				<time className="self-stretch my-auto font-medium tracking-tight text-neutral-400">
					{timestamp}
				</time>
				<PointsBadge points={points} />
			</header>
			<p className="mt-2 font-medium tracking-tight text-black max-md:max-w-full">
				{message.split("#").map((part, index) => {
					if (index === 0) return part
					const hashtagEnd = part.indexOf(" ")
					if (hashtagEnd === -1) {
						return (
							<span key={index}>
								<span style={{ color: "rgba(0,122,255,1)" }}>#{part}</span>
							</span>
						)
					}
					return (
						<span key={index}>
							<span style={{ color: "rgba(0,122,255,1)" }}>
								#{part.slice(0, hashtagEnd)}
							</span>
							{part.slice(hashtagEnd)}
						</span>
					)
				})}
			</p>
		</article>
	)
}

export default UserQuest
