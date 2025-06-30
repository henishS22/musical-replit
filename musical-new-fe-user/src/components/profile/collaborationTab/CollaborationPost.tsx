"use client"

import React from "react"
import Image from "next/image"

import { PROFILE_IMAGE, SavedIcon } from "@/assets"
import AttachedFile from "@/components/modal/postOpportunity/AttachedFile"

interface CollaborationPostProps {
	title: string
	description: string
	tags: string[]
	attachedFiles: {
		type: string
		title: string
		artist: string
		duration: string
		trackId: string
		artwork: string
		trackUrl: string
	}[]
	tab: string
	name: string
	timeAgo: string
	status?: string
	isFavorite: boolean
	avatarSrc: string
}

export const CollaborationPost: React.FC<CollaborationPostProps> = ({
	title,
	description,
	tags,
	attachedFiles,
	tab,
	name,
	timeAgo,
	status,
	isFavorite,
	avatarSrc
}) => {
	return (
		<div className="flex flex-col px-6 py-3 w-full rounded-lg border border-solid border-zinc-100 max-md:px-5 max-md:max-w-full">
			{tab === "applied" && (
				<div className="flex flex-wrap gap-10 justify-between items-center w-full max-md:max-w-full my-3">
					<div className="flex gap-2 items-center self-stretch my-auto font-bold leading-6 min-w-[240px]">
						<Image
							loading="lazy"
							src={avatarSrc || PROFILE_IMAGE}
							className="object-contain shrink-0 self-stretch my-auto w-12 rounded-full aspect-square"
							alt={`${name}'s avatar`}
							width={48}
							height={48}
						/>
						<div className="flex gap-4 items-center self-stretch my-auto min-w-[240px]">
							<div className="self-stretch my-auto text-base tracking-normal text-zinc-900">
								{name}{" "}
								<span className="text-sm text-gray-500 ml-1">{timeAgo}</span>
							</div>
							<div
								className={`gap-2 self-stretch px-4 py-1 my-auto text-sm tracking-normal whitespace-nowrap rounded-lg ${
									status === "Expired"
										? "bg-red-100 text-red-500"
										: "bg-green-100 text-slate-500"
								}`}
							>
								{status}
							</div>
						</div>
					</div>
					<SavedIcon isLiked={isFavorite} />
				</div>
			)}
			<div className="flex flex-col w-full max-md:max-w-full">
				<h2 className="text-base font-bold tracking-normal text-zinc-900 max-md:max-w-full">
					{title}
				</h2>
				<p className="mt-2 text-sm font-medium tracking-normal leading-6 text-gray-500 max-md:max-w-full">
					{description}
				</p>
			</div>
			<div className="flex flex-wrap gap-2 items-center mt-4 max-w-full text-xs font-medium tracking-normal leading-6 whitespace-nowrap text-neutral-700 w-[632px]">
				{tags.map((tag, index) => (
					<div
						key={index}
						className="flex flex-col self-stretch px-2 my-auto rounded-lg border border-solid bg-zinc-100 border-zinc-100"
					>
						<div className="gap-1.5 self-stretch w-full">{tag}</div>
					</div>
				))}
			</div>
			<div className="flex flex-col mt-4 w-full max-md:max-w-full">
				{attachedFiles.map((file, index) => (
					<AttachedFile
						key={index}
						audioFile={{
							name: file.title,
							extension: file.type,
							duration: file.duration,
							imageWaveBig: "",
							_id: file.trackId,
							artwork: file.artwork,
							url: file.trackUrl
						}}
						creator={file.artist}
					/>
				))}
			</div>
		</div>
	)
}
