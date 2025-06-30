"use client"

import React from "react"
import Image from "next/image"

import { CHAT_POPUP_ICON, PROFILE_IMAGE } from "@/assets"
import { CustomInput } from "@/components/ui"
import { Accordion, AccordionItem } from "@nextui-org/react"
import { ChevronDown, SearchIcon } from "lucide-react"

interface ChatSidebarProps {
	selectedChat: string | null
	onSelectChat: (chat: string) => void
}

export default function ChatSidebar({
	selectedChat,
	onSelectChat
}: ChatSidebarProps) {
	return (
		<div className="w-[266px] flex flex-col">
			{/* Chat Header */}
			<div className="px-6 py-[10px] flex items-center gap-3 shadow-[0px_1px_2px_0px_#0000004D]">
				<span className="bg-btnColor rounded-full p-2">
					<Image src={CHAT_POPUP_ICON} alt="Chat" width={24} height={24} />
				</span>
				<h2 className="font-manrope font-bold text-[22px] leading-[100%]">
					Chats
				</h2>
			</div>

			{/* Search Bar */}
			<div>
				<CustomInput
					type="text"
					placeholder="Search chats..."
					classname="!border-2 !border-[#F4F4F4] !border-r-0"
					rounded="rounded-lg"
					startContent={<SearchIcon className="text-gray-500" size={16} />}
				/>
			</div>

			{/* Chat Lists */}
			<div className="flex-1 overflow-y-auto scrollbar-hide">
				{/* AI Chat Item */}
				<div
					className="flex items-center justify-between w-full py-3 px-6 cursor-pointer"
					onClick={() => onSelectChat("Aria AI")}
				>
					<span className="font-manrope font-bold text-[14px] leading-[24px] tracking-[-1%]">
						Aria AI
					</span>
				</div>

				{/* Accordions */}
				<Accordion
					className="px-0"
					showDivider={false}
					itemClasses={{
						base: "px-0",
						title: "px-0"
					}}
				>
					{["DMs", "Socials", "Projects"].map((title, index) => (
						<AccordionItem
							key={index}
							aria-label={title}
							title={
								<div className="flex items-center justify-between w-full">
									<span className="font-manrope font-bold text-[14px] leading-[24px] tracking-[-1%]">
										{title}
									</span>
								</div>
							}
							indicator={<ChevronDown className="w-4 h-4" />}
							classNames={{
								trigger: "bg-white py-3 px-6",
								title: "bg-white",
								base: "bg-white px-0",
								heading: "!px-0",
								titleWrapper: "px-0"
							}}
						>
							{/* Chat Items */}
							{["User 1", "User 2"].map((name, idx) => (
								<div
									key={idx}
									onClick={() => onSelectChat(name)}
									className={`flex items-center gap-3 p-3 cursor-pointer ${
										selectedChat === name ? "bg-[#F4F4F4]" : ""
									} hover:bg-[#F4F4F4]`}
								>
									<Image
										src={PROFILE_IMAGE}
										alt="Chat"
										width={56}
										height={56}
									/>
									<div className="flex flex-col flex-1">
										<div className="flex justify-between items-center">
											<span className="font-bold text-[14px] leading-[24px] tracking-[-0.01em]">
												{name}
											</span>
											<div className="flex items-center gap-2">
												<span className="font-semibold text-[13px] leading-[16px] tracking-[-1%] text-[#1DB954]">
													11:30 AM
												</span>
												<span className="bg-[#1DB954] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
													1
												</span>
											</div>
										</div>
										<p className="font-medium text-[12px] leading-[24px] tracking-[-0.015em] text-[#6F767E] truncate">
											Last message preview...
										</p>
									</div>
								</div>
							))}
						</AccordionItem>
					))}
				</Accordion>
			</div>
		</div>
	)
}
