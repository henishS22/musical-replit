"use client"

import { useState } from "react"
import { toast } from "react-toastify"

import { deleteCommunityTopic } from "@/app/api/mutation"
import {
	fetchAllTopics,
	fetchForums,
	fetchSearchForumTopics
} from "@/app/api/query"
import {
	CONFIRMATION_MODAL,
	POST_COMMUNITY_TOPIC_MODAL
} from "@/constant/modalType"
import generateQueryParams from "@/helpers/generateQueryParams"
import { Topic } from "@/types/communityTypes"
import { Accordion, AccordionItem, Skeleton } from "@nextui-org/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { MinusIcon, PlusIcon, SearchIcon } from "lucide-react"

import { useModalStore } from "@/stores"
import { useDebounce } from "@/hooks/useDebounce"

import { CustomInput } from "../../ui"
import CommunityHeader from "../CommunityHeader"
import DiscussionCard from "../DiscussionCard"
import RecentTopics from "../RecentTopics"

interface CommunityForumProps {
	onDiscussionSelect?: (id: string) => void
}

export default function CommunityForum({
	onDiscussionSelect
}: CommunityForumProps) {
	const [txtFilter, setTxtFilter] = useState("")
	const { showCustomModal, hideCustomModal } = useModalStore()
	const searchQuery = useDebounce(txtFilter, 1000)
	const queryClient = useQueryClient()

	const { data: forums = [], isPending: isForumsLoading } = useQuery({
		queryKey: ["forums"],
		queryFn: fetchForums
	})

	const { data: topics = [], isPending: isTopicsLoading } = useQuery({
		queryKey: ["topics"],
		queryFn: fetchAllTopics
	})

	const { data: searchTopics = [], isLoading: isSearchTopicsLoading } =
		useQuery({
			queryKey: ["searchTopics", searchQuery],
			queryFn: () =>
				fetchSearchForumTopics(generateQueryParams({ query: searchQuery })),
			enabled: !!searchQuery
		})

	const { mutate: deleteMutation, isPending } = useMutation({
		mutationFn: deleteCommunityTopic,
		onSuccess: (data) => {
			if (data && !data.error) {
				toast.success("Topic deleted successfully!")
				queryClient.invalidateQueries({ queryKey: ["topics"] })
				hideCustomModal()
			}
		}
	})

	// Group topics by forum, excluding topics without forumId
	const topicsByForum =
		forums?.length > 0
			? forums?.map((forum) => ({
					...forum,
					topics: topics.filter((topic) => {
						// Only include topics that have a valid forumId
						return topic.forumId?._id === forum._id
					})
				}))
			: []

	const handleDelete = (id: string) => {
		showCustomModal({
			customModalType: CONFIRMATION_MODAL,
			tempCustomModalData: {
				title: "Delete Topic",
				msg: "Are you sure you want to delete this topic?",
				isLoading: isPending
			},
			modalFunction: () => deleteMutation(id)
		})
	}

	const handleEdit = (id: string) => {
		showCustomModal({
			customModalType: POST_COMMUNITY_TOPIC_MODAL,
			tempCustomModalData: {
				topicId: id
			}
		})
	}

	return (
		<div className="flex relative flex-col items-start mt-[14px] gap-[26px]">
			<CommunityHeader
				onClick={() => {
					showCustomModal({
						customModalType: POST_COMMUNITY_TOPIC_MODAL
					})
				}}
			/>

			<CustomInput
				wrapperClassName="w-full"
				value={txtFilter}
				onChange={(e) => setTxtFilter(e.target.value)}
				type="text"
				placeholder="Search"
				classname={`border-2 !border-hoverGray !shadow-none`}
				rounded="rounded-lg"
				labelClassName="font-bold text-[14px] leading-[21px] tracking-[-1.5%] text-inputLabel"
				startContent={
					<SearchIcon className="text-gray-500" height={16} width={16} />
				}
			/>

			<div className="font-bold text-[15px] leading-6 tracking-[-0.01em] text-textPrimary py-2">
				Community Forum
			</div>

			<div className="flex gap-6 w-full">
				<div className="flex-[2] flex flex-col gap-4 border border-[#F4F4F4] rounded-xl p-[20px]">
					{(isSearchTopicsLoading && searchQuery) ||
					isTopicsLoading ||
					isForumsLoading ? (
						Array(3)
							.fill(0)
							.map((_, idx) => (
								<div key={idx} className="flex flex-col gap-4">
									<Skeleton className="h-12 w-full rounded-lg" />
								</div>
							))
					) : searchQuery ? (
						<div className="max-h-[400px] flex flex-col gap-3 overflow-y-auto scrollbar">
							{searchTopics?.length > 0 ? (
								searchTopics.map((topic: Topic, idx: number) => (
									<DiscussionCard
										key={idx}
										item={topic}
										onClick={() => onDiscussionSelect?.(topic._id)}
										handleDelete={handleDelete}
										handleEdit={handleEdit}
									/>
								))
							) : (
								<div className="text-center text-gray-500">
									No results found
								</div>
							)}
						</div>
					) : (
						topicsByForum?.length > 0 &&
						topicsByForum?.map((forum, idx) => (
							<Accordion
								key={idx}
								itemClasses={{
									base: "gap-4 border-none",
									trigger: "bg-[#DDF5E5] px-4 py-2 rounded-lg",
									content: "pt-4 max-h-[400px] overflow-y-auto scrollbar",
									title: "font-semibold text-lg"
								}}
							>
								<AccordionItem
									key={`${idx}`}
									title={forum?.name}
									indicator={({ isOpen }) =>
										isOpen ? (
											<MinusIcon
												className="!text-textPrimary transform rotate-90"
												width={24}
												height={24}
											/>
										) : (
											<PlusIcon
												className="!text-textPrimary transform rotate-90"
												width={24}
												height={24}
											/>
										)
									}
								>
									<div className="flex flex-col gap-4">
										{forum?.topics?.map((topic: Topic, topicIdx: number) => (
											<DiscussionCard
												key={topicIdx}
												item={topic}
												onClick={() => onDiscussionSelect?.(topic?._id)}
												handleDelete={handleDelete}
												handleEdit={handleEdit}
											/>
										))}
									</div>
								</AccordionItem>
							</Accordion>
						))
					)}
				</div>
				<div className="flex-1">
					{isTopicsLoading ? (
						<Skeleton className="h-[324px] w-full rounded-lg" />
					) : (
						<RecentTopics
							onDiscussionSelect={(id) => {
								onDiscussionSelect?.(id)
								setTxtFilter("")
							}}
							topics={topics}
						/>
					)}
				</div>
			</div>
		</div>
	)
}
