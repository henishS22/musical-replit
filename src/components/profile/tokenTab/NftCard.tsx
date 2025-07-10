"use client"

import React from "react"
import Image, { StaticImageData } from "next/image"
import { useRouter } from "next/navigation"

import { PLAY_ICON_2 } from "@/assets"

interface NFTCardProps {
	artworkUrl: string | StaticImageData
	title: string
	duration?: string
	artist: string
	id: string
	redirectPath?: string
}

const NFTCard: React.FC<NFTCardProps> = ({
	artworkUrl,
	title,
	artist,
	redirectPath
}) => {
	const router = useRouter()

	return (
		<div
			className="flex overflow-hidden flex-col justify-center p-3 rounded-lg border border-green-500 border-solid bg-zinc-50 min-w-[240px] w-[244px] cursor-pointer"
			onClick={() =>
				redirectPath ? router.push(redirectPath as string) : null
			}
		>
			<div className="flex flex-col w-full max-w-[220px]">
				<Image
					loading="lazy"
					src={artworkUrl}
					className="object-contain w-full rounded aspect-[1.02] max-h-[214px]"
					alt={`${title} by ${artist}`}
					width={220}
					height={214}
				/>

				<div className="flex gap-4 items-start mt-4 w-full">
					<Image
						loading="lazy"
						src={PLAY_ICON_2}
						className="object-contain shrink-0 w-8 aspect-square"
						alt=""
						width={32}
						height={32}
					/>
					<div className="flex flex-col flex-1 shrink basis-0">
						<div className="flex gap-3 justify-between items-start w-full leading-relaxed text-zinc-900">
							<div className="text-xl font-semibold tracking-tight cursor-pointer truncate max-w-[180px]">
								{title}
							</div>
							{/* <div className="overflow-hidden px-2 py-1 text-base font-bold tracking-normal text-center bg-green-200 rounded-md">
								{duration}
							</div> */}
						</div>
						<div className="flex gap-3 items-center self-start text-sm leading-6">
							<div className="flex gap-1 items-center self-stretch my-auto">
								<div className="self-stretch my-auto font-medium tracking-tight text-gray-500">
									by
								</div>
								<div className="self-stretch my-auto font-semibold tracking-normal text-zinc-900">
									{artist}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default NFTCard
