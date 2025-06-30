"use client"

import React from "react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"

import { LOUD_SPEAKER, PROFILE_IMAGE } from "@/assets"
import { Message } from "@/types/projectDetails"
import moment from "moment"

import { useDynamicStore } from "@/stores"

function ProjectChannel({
	messages,
	projectName
}: {
	messages: Message[]
	projectName: string
}) {
	const router = useRouter()
	const { id } = useParams()
	const { addState } = useDynamicStore()
	const handleExpandChat = () => {
		addState("ChatPop", {
			open: true,
			id: id as string
		})
	}

	return (
		<div className="flex flex-col p-4 mt-4 w-full rounded-lg border-2 border-solid border-neutral-100">
			<div className="flex flex-col items-start w-full">
				<div className="gap-4 self-stretch text-sm font-bold tracking-normal leading-6 text-zinc-900">
					Project Channel
				</div>
				<div className="flex gap-2 items-center mt-3 text-xs font-medium tracking-normal text-gray-500">
					<Image
						loading="lazy"
						src={LOUD_SPEAKER}
						className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
						alt="loud-speaker"
						width={16}
					/>
					<div className="self-stretch my-auto">{projectName}</div>
				</div>
			</div>
			<div className="mt-4 w-full border border-solid border-neutral-100 min-h-[1px]" />
			<div className="flex flex-col mt-4 w-full rounded-lg">
				<div className="flex items-center justify-end w-full font-bold leading-6">
					<div
						className="gap-2 self-stretch px-2 py-1 my-auto text-xs tracking-normal bg-green-100 rounded-lg text-slate-500 cursor-pointer"
						onClick={() => {
							handleExpandChat()
						}}
					>
						Expand Chat
					</div>
				</div>
				{messages.length > 0 ? (
					<div className="flex flex-col mt-4 w-full rounded-lg">
						<div className="flex gap-2 items-center w-full text-xs font-medium tracking-normal text-gray-500 whitespace-nowrap">
							<div className="self-stretch my-auto">
								{moment(messages[0]?.created_at).calendar(null, {
									sameDay: "[Today]",
									lastDay: "[Yesterday]",
									lastWeek: "MM/DD/YYYY",
									sameElse: "MM/DD/YYYY"
								})}
							</div>
							<div className="flex-1 shrink self-stretch my-auto h-px border border-solid basis-0 border-zinc-100 w-[132px]" />
						</div>
						{messages.map((message, index) => (
							<div key={index} className="flex gap-4 items-center mt-2 w-full">
								<Image
									loading="lazy"
									src={message.user.image || PROFILE_IMAGE}
									className="object-contain shrink-0 w-10 aspect-square rounded-full"
									alt={`${message.user.name}'s avatar`}
									width={16}
									height={16}
								/>
								<div className="flex flex-col flex-1 shrink basis-0 min-w-[240px]">
									<div className="flex gap-3 items-center self-start font-semibold whitespace-nowrap">
										<div className="flex gap-1 items-center self-stretch my-auto text-base tracking-normal leading-relaxed text-gray-500">
											<div
												className="self-stretch my-auto cursor-pointer"
												onClick={() => {
													router.push(`/profile/${message?.user?.id}`)
												}}
											>
												{message?.user?.name || "Anonymous"}
											</div>
										</div>
										<div className="self-stretch my-auto text-sm tracking-normal leading-none text-zinc-400">
											{moment(message?.created_at).format("h:mm A")}
										</div>
									</div>
									<div className="mt-1 text-base font-medium tracking-tight leading-6 text-zinc-900">
										{message?.text}
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="flex flex-col mt-4 w-full rounded-lg">
						<div className="flex gap-2 items-center w-full text-xs font-medium tracking-normal text-gray-500 whitespace-nowrap">
							<div className="self-stretch my-auto">No messages yet</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

export default ProjectChannel
