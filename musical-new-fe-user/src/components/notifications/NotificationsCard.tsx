import Image from "next/image"

import { PROFILE_IMAGE } from "@/assets"
import { formatRelativeTime } from "@/helpers/formatDateHelpers"

// import { getNotificationContent } from "@/helpers/notificationHelpers"
// import { NotificationData } from "@/types/notificationTypes"

interface NotificationCardProps {
	user: {
		name: string
		avatar: string
		// username: string
	}
	action: string
	target: string
	time: string
	read: boolean
}

export const NotificationCard = ({
	user,
	action,
	target,
	time,
	read
}: NotificationCardProps) => {
	return (
		<div className="flex gap-3 items-start p-4 hover:bg-gray-50 rounded-lg cursor-pointer">
			<Image
				alt="profile_img"
				width={48}
				height={48}
				src={user.avatar || PROFILE_IMAGE}
				className="w-[48px] h-[48px] rounded-full flex-shrink-0 border border-metallicGray"
			/>
			<div className="flex-1">
				<div className="flex items-center gap-1">
					<span className="font-bold text-[15px] leading-[24px] tracking-[-0.01em] text-textPrimary">
						{user.name}
					</span>
					{/* <span className="font-normal text-[15px] leading-[24px] tracking-[-0.015em] text-[#9A9FA5]">
						@{user.username}
					</span> */}
				</div>
				<p className="font-bold text-[15px] leading-[24px] tracking-[-0.01em] text-textPrimary flex gap-1">
					<span className="font-normal text-[15px] leading-[24px] tracking-[-0.015em] text-[#9A9FA5]">
						{action}
					</span>
					{target}
				</p>
			</div>
			{!read && (
				<div className="flex items-center gap-4">
					<p className="text-[13px] font-bold leading-[16px] tracking-[-0.01em] text-gray-500 mt-1">
						{formatRelativeTime(time)}
					</p>
					<div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
				</div>
			)}
		</div>
	)
}
