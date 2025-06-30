import Image from "next/image"
import { useRouter } from "next/navigation"

import { PROFILE_IMAGE } from "@/assets"
import { TopicUser } from "@/types/communityTypes"
import {
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger
} from "@nextui-org/react"
import { format } from "date-fns"
import { Ellipsis, EyeIcon, MessageCircleIcon } from "lucide-react"

import { useUserStore } from "@/stores"

interface DiscussionCardProps {
	item: {
		_id: string
		title: string
		repliesCount: number
		viewCount: number
		lastReplyFrom: TopicUser | null
		lastActivity: string
		userId: TopicUser | null
	}
	onClick?: () => void
	handleDelete: (id: string) => void
	handleEdit: (id: string) => void
}

export default function DiscussionCard({
	item,
	onClick,
	handleDelete,
	handleEdit
}: DiscussionCardProps) {
	const router = useRouter()
	const { userData } = useUserStore()
	return (
		<div
			onClick={onClick}
			className="flex justify-between items-end px-6 py-3 hover:bg-gray-50 rounded-lg border border-[#F4F4F4] cursor-pointer"
		>
			<div className="flex-[2] flex flex-col gap-2">
				<div className="flex justify-between">
					<h3 className="font-bold text-[18px] leading-6 tracking-[-0.01em] text-textPrimary">
						{item.title}
					</h3>
				</div>
				<div className="flex gap-[10px] font-normal text-[10px] leading-[100%] tracking-[-0.01em] text-textGray">
					<span className="flex gap-1 items-center">
						<MessageCircleIcon width={16} height={16} />
						<span>Replies: {item.repliesCount}</span>
					</span>
					<span className="flex gap-1 items-center">
						<EyeIcon width={16} height={16} />
						<span>Views: {item.viewCount}</span>
					</span>
				</div>
			</div>
			<div className="flex-1 flex flex-col items-end justify-between h-full">
				{userData?._id === item?.userId?._id && (
					<>
						<div className="self-end">
							<Dropdown>
								<DropdownTrigger>
									<Ellipsis size={18} />
								</DropdownTrigger>
								<DropdownMenu>
									<DropdownItem key="edit" onPress={() => handleEdit(item._id)}>
										Edit
									</DropdownItem>
									<DropdownItem
										key="delete"
										onPress={() => handleDelete(item._id)}
									>
										Delete
									</DropdownItem>
								</DropdownMenu>
							</Dropdown>
						</div>
					</>
				)}
				<div className="text-right items-center text-sm text-gray-500 mt-2">
					<div className="flex items-center gap-3">
						<div className="flex-1 gap-1 items-center font-normal text-[10px] leading-[100%] tracking-[-0.01em]">
							Last Post
						</div>
						<div
							className="flex gap-1 items-start cursor-pointer"
							onClick={(e) => {
								e.stopPropagation()
								router.push(`/profile/${item.lastReplyFrom?._id}`)
							}}
						>
							<Image
								src={
									item.lastReplyFrom?.profile_img ||
									item.userId?.profile_img ||
									PROFILE_IMAGE
								}
								alt="user"
								width={20}
								height={20}
								className="rounded-full object-cover"
							/>
							<div className="flex flex-col">
								<span className="font-medium text-[10px] leading-[16px] tracking-[-0.01em] text-textGray text-left">
									By {item.lastReplyFrom?.name || item.userId?.name}
								</span>
								<div className="font-semibold text-[10px] leading-[16px] tracking-[-0.01em] text-[#9A9FA5] text-left whitespace-nowrap">
									{format(new Date(item.lastActivity), "MMM d, yyyy HH:mm")}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
