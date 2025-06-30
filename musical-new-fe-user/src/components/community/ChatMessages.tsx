import React from "react"
import Image from "next/image"

import { PROFILE_IMAGE } from "@/assets"

interface ChatMessagesProps {
	selectedChat: string | null
}

export default function ChatMessages({ selectedChat }: ChatMessagesProps) {
	return (
		<div className="flex-1 p-6 overflow-y-auto bg-white">
			{selectedChat ? (
				<div className="flex flex-col gap-4">
					{/* Message from other user (left aligned) */}
					<div className="flex items-start gap-4">
						<Image
							src={PROFILE_IMAGE}
							alt="Profile"
							width={32}
							height={32}
							className="rounded-full"
						/>
						<div className="flex flex-col gap-1">
							<div className="flex items-center gap-3">
								<span className="text-textGray text-[15px] font-semibold leading-[24px] tracking-[-0.01em]">
									{selectedChat}
								</span>
								<span className="text-[#9A9FA5] font-semibold text-[13px] leading-[16px] tracking-[-0.01em]">
									11:25PM
								</span>
							</div>
							<div className="bg-white max-w-[280px]">
								<p className="text-[15px] font-semibold leading-[24px] tracking-[-0.01em]">
									When do you release the coded for the Fleet - Travel kit?
								</p>
							</div>
						</div>
					</div>

					{/* Message from current user (right aligned) */}
					<div className="flex items-start gap-4 flex-row-reverse">
						<Image
							src={PROFILE_IMAGE}
							alt="Profile"
							width={32}
							height={32}
							className="rounded-full"
						/>
						<div className="flex flex-col gap-1 items-end">
							<div className="flex items-center gap-3">
								<span className="text-textGray text-[15px] font-semibold leading-[24px] tracking-[-0.01em]">
									You
								</span>
								<span className="text-[#9A9FA5] font-semibold text-[13px] leading-[16px] tracking-[-0.01em]">
									11:25PM
								</span>
							</div>
							<div className="bg-white max-w-[280px]">
								<p className="text-[15px] font-semibold leading-[24px] tracking-[-0.01em]">
									When do you release the coded for the Fleet - Travel kit?
								</p>
							</div>
						</div>
					</div>
				</div>
			) : (
				<div className="h-full flex items-center justify-center text-gray-500">
					Select a chat to start messaging
				</div>
			)}
		</div>
	)
}
