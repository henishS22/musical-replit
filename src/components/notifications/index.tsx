"use client"

import { useRouter } from "next/navigation"

import { markAsRead } from "@/app/api/mutation"
import { fetchNotifications, markAllNotificationsAsRead } from "@/app/api/query"
import { generateQueryParams } from "@/helpers"
import { getNotificationContent } from "@/helpers/notificationHelpers"
import { NotificationData } from "@/types/notificationTypes"
import {
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger
} from "@nextui-org/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Ellipsis } from "lucide-react"

import { TitleBadgeCard } from "../ui/titleBadgeCard"
import { NotificationCard } from "./NotificationsCard"

export const Notifications = () => {
	const router = useRouter()
	const queryClient = useQueryClient()

	const { data: notifications } = useQuery({
		queryKey: ["notifications"],
		queryFn: () => fetchNotifications(generateQueryParams({ viewed: "ALL" })),
		refetchInterval: 30000
	})

	const { mutate: markAllAsReadMutation } = useMutation({
		mutationFn: markAllNotificationsAsRead,
		onSuccess: (data) => {
			if (data) {
				queryClient.invalidateQueries({ queryKey: ["notifications"] })
			}
		}
	})

	const { mutate: markAsReadMutation } = useMutation({
		mutationFn: markAsRead,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notifications"] })
		}
	})

	const handleNotificationRead = (id: string, link?: string) => {
		markAsReadMutation({ id })
		if (link) {
			router.push(link)
		}
	}

	const EllipsisComponent = () => (
		<div className="flex gap-2.5 items-start self-stretch">
			<Dropdown
				placement="bottom-end"
				isDisabled={notifications?.length === 0 || !notifications}
			>
				<DropdownTrigger>
					<button className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
						<Ellipsis size={24} color={"#6F767E"} />
					</button>
				</DropdownTrigger>
				<DropdownMenu aria-label="Notification Actions">
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
	)

	return (
		<div className="flex flex-col gap-6">
			<p className="text-[40px] leading-[48px] tracking-[-0.02em] font-semibold text-[#272B30]">
				Notifications
			</p>
			<TitleBadgeCard
				title="New"
				markColor="#FFBC99"
				subComponent={<EllipsisComponent />}
				wrapperClass="mx-auto bg-white"
			>
				<div className="flex flex-col gap-5">
					{!notifications || notifications.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-16">
							<p className="text-[15px] leading-[24px] tracking-[-0.01em] text-textPrimary">
								No notifications yet
							</p>
							<p className="text-[13px] leading-[20px] tracking-[-0.01em] text-[#9A9FA5]">
								When you get notifications, they&apos;ll show up here
							</p>
						</div>
					) : (
						notifications?.map(
							(notification: NotificationData, index: number) => {
								const { action, target, link } =
									getNotificationContent(notification)
								return (
									<div
										key={notification?._id}
										onClick={() =>
											handleNotificationRead(notification._id, link)
										}
										className={`${
											index !== notifications.length - 1
												? "border-b border-[#EFEFEF] pb-5 mb-5"
												: ""
										}`}
									>
										<NotificationCard
											user={{
												name: notification?.from?.name,
												avatar: notification?.from?.profile_img
											}}
											action={action}
											target={target || ""}
											time={notification?.createdAt}
											read={notification?.viewed}
										/>
									</div>
								)
							}
						)
					)}
				</div>
			</TitleBadgeCard>
		</div>
	)
}
