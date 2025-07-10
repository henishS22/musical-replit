import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

import { markAsRead } from "@/app/api/mutation"
import { fetchNotifications, markAllNotificationsAsRead } from "@/app/api/query"
import { PROFILE_IMAGE } from "@/assets"
import { generateQueryParams } from "@/helpers"
import { formatRelativeTime } from "@/helpers/formatDateHelpers"
import { getNotificationContent } from "@/helpers/notificationHelpers"
import { NotificationData } from "@/types/notificationTypes"
import {
	Button,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
	Popover,
	PopoverContent,
	PopoverTrigger
} from "@nextui-org/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Bell, Ellipsis } from "lucide-react"

interface ExpandButtonProps {
	expanded: boolean
	onToggle: () => void
}

const ExpandButton: React.FC<ExpandButtonProps> = ({ expanded, onToggle }) => {
	const handleClick = (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
		onToggle()
	}

	return (
		<button onClick={handleClick} className="text-blue-500 underline ml-1">
			{expanded ? "Read Less" : "Read More"}
		</button>
	)
}

interface NotificationCardProps {
	notification: NotificationData
	expanded: boolean
	onToggle: () => void
	onClick: () => void
}

const NotificationCard: React.FC<NotificationCardProps> = ({
	notification,
	expanded,
	onToggle,
	onClick
}) => {
	const { action, target } = getNotificationContent(notification)

	const handleClick = (e: React.MouseEvent) => {
		if (!(e.target as HTMLElement).closest(".read-more-btn")) {
			onClick()
		}
	}

	return (
		<div
			onClick={handleClick}
			className="p-3 rounded-lg hover:bg-default-100 cursor-pointer transition-colors"
		>
			<div className="flex gap-3 items-start w-full">
				<Image
					alt="profile_img"
					width={48}
					height={48}
					src={notification.from.profile_img || PROFILE_IMAGE}
					className="w-[48px] h-[48px] rounded-full flex-shrink-0 border border-metallicGray"
				/>
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-1">
						<span className="font-bold text-[15px] leading-[24px] tracking-[-0.01em] text-textPrimary truncate max-w-[120px]">
							{notification.from.name}
						</span>
					</div>
					<p className="font-bold text-[15px] leading-[24px] tracking-[-0.01em] text-textPrimary">
						<div className={`${expanded ? "block" : "truncate max-w-[150px]"}`}>
							<span className="font-normal text-[15px] leading-[24px] tracking-[-0.015em] text-[#9A9FA5] block truncate text-ellipsis">
								{action}
							</span>
							{expanded && <span className="block">{target}</span>}
						</div>
						<ExpandButton expanded={expanded} onToggle={onToggle} />
					</p>
				</div>
				{!notification.viewed && (
					<div className="flex items-center gap-2 flex-shrink-0 ml-auto">
						<p className="text-[13px] font-bold leading-[16px] tracking-[-0.01em] text-gray-500 whitespace-nowrap">
							{formatRelativeTime(notification.createdAt)}
						</p>
						<div className="w-2 h-2 bg-blue-500 rounded-full" />
					</div>
				)}
			</div>
		</div>
	)
}

const NotificationsDropdown = () => {
	const router = useRouter()
	const queryClient = useQueryClient()
	const [expanded, setExpanded] = useState<Record<string, boolean>>({})
	const [isOpen, setIsOpen] = useState(false)

	const { data: notifications } = useQuery({
		queryKey: ["notificationsNotSeen"],
		queryFn: () => fetchNotifications(generateQueryParams({ viewed: "ALL" })),
		refetchInterval: 30000
	})

	const { mutate: markAllAsReadMutation } = useMutation({
		mutationFn: markAllNotificationsAsRead,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notificationsNotSeen"] })
		}
	})

	const { mutate: markAsReadMutation } = useMutation({
		mutationFn: markAsRead,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notificationsNotSeen"] })
		}
	})

	const handleNotificationClick = (id: string, link?: string) => {
		markAsReadMutation({ id })
		setIsOpen(false)
		if (link) {
			router.push(link)
		}
	}

	const handleSeeAllClick = () => {
		setIsOpen(false)
		router.push("/notifications")
	}

	return (
		<div className="relative">
			<Popover
				placement="bottom-start"
				isOpen={isOpen}
				onOpenChange={setIsOpen}
				classNames={{
					base: "p-3",
					content: "p-0 rounded-xl"
				}}
				shouldCloseOnScroll={false}
				shouldBlockScroll
			>
				<PopoverTrigger>
					<button className="relative">
						<Bell className="w-8 h-8" />
						{notifications &&
							notifications?.length &&
							notifications?.some((n: NotificationData) => !n.viewed) && (
								<div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
							)}
					</button>
				</PopoverTrigger>
				<PopoverContent>
					<div className="w-[392px] p-3">
						<div className="flex flex-col gap-3">
							{/* Header */}
							<div className="h-14 hover:bg-transparent flex items-center">
								<div className="flex justify-between items-center w-full">
									<span className="text-[20px] leading-[32px] tracking-[-0.02em] font-bold ml-3">
										Notifications
									</span>
									<Dropdown
										isDisabled={notifications?.length === 0 || !notifications}
									>
										<DropdownTrigger className="p-1 bg-hoverGray rounded-full">
											<Ellipsis size={32} />
										</DropdownTrigger>
										<DropdownMenu>
											<DropdownItem
												key="markAllAsRead"
												onPress={() => {
													if (notifications?.length > 0) {
														markAllAsReadMutation()
													}
												}}
											>
												Mark all as read
											</DropdownItem>
										</DropdownMenu>
									</Dropdown>
								</div>
							</div>

							{/* Notifications Section with Border */}
							<div className="border-b border-[#EFEFEF]">
								{!notifications || notifications?.length === 0 ? (
									<div className="h-[100px] hover:bg-transparent flex items-center justify-center">
										<p className="text-[15px] leading-[24px] tracking-[-0.01em] text-textPrimary text-center">
											No new notifications
										</p>
									</div>
								) : (
									<div className="flex flex-col gap-2">
										{notifications
											?.slice(0, 5)
											?.map((notification: NotificationData) => {
												const { link } = getNotificationContent(notification)
												return (
													<NotificationCard
														key={notification._id}
														notification={notification}
														expanded={!!expanded[notification._id]}
														onToggle={() =>
															setExpanded((prev) => ({
																...prev,
																[notification._id]: !prev[notification._id]
															}))
														}
														onClick={() =>
															handleNotificationClick(notification._id, link)
														}
													/>
												)
											})}
									</div>
								)}
							</div>

							{/* See All Button */}
							{notifications?.length > 5 && (
								<div className="flex items-center justify-center p-3">
									<Button
										onPress={handleSeeAllClick}
										className="w-full text-[15px] leading-[24px] tracking-[-0.01em] text-[#1DB954] font-bold py-3 bg-videoBtnGreen rounded-lg"
									>
										See all notifications
									</Button>
								</div>
							)}
						</div>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	)
}

export default NotificationsDropdown
