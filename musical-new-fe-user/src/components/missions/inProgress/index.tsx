"use client"

import React from "react"

import { fetchPublishedQuest } from "@/app/api/query"
import { NoDataFound } from "@/components/ui"
import {
	CREATE_MISSION_MODAL,
	PUUBLISHUNPUBLISH_MODAL
} from "@/constant/modalType"
import { useQuery } from "@tanstack/react-query"
import moment from "moment"

import { useDynamicStore, useModalStore } from "@/stores"

import { SocialIcons } from "../socialIcons"
import InProgressCard from "./InProgressCard"
import InProgressCardSkeleton from "./InProgressCardSkeleton"

interface InProgressQuest {
	name: string
	createdAt: string
	description: string
	isPublished: boolean
	_id: string
	questId: { name: string; _id: string }
	identifier: string
	metaData: {
		caption: string
		hashtags: string[]
		mentions: string[]
	}
}

export const InProgress: React.FC = () => {
	const { showCustomModal } = useModalStore()
	const { addState } = useDynamicStore()
	const { data: questData, isFetching } = useQuery({
		queryKey: ["inprogress"],
		queryFn: fetchPublishedQuest,
		staleTime: 1000 * 60 * 60 * 24
	})

	const handleClick = (item: InProgressQuest) => {
		if (!item.isPublished) {
			// Open CREATE_MISSION_MODAL with pre-filled data for "Re-start"
			addState(
				"hashtags",
				(item?.metaData?.hashtags || []).map((h: string) => h.replace(/^#/, ""))
			)
			addState(
				"mentions",
				(item?.metaData?.mentions || []).map((m: string) => m.replace(/^@/, ""))
			)
			showCustomModal({
				customModalType: CREATE_MISSION_MODAL,
				tempCustomModalData: {
					...item,
					creatorQuestId: item._id,
					title: item?.questId?.name,
					identifier: item.identifier,
					description: item.description
				}
			})
		} else {
			// Existing unpublish flow
			showCustomModal({
				customModalType: PUUBLISHUNPUBLISH_MODAL,
				tempCustomModalData: {
					creatorQuestId: item._id,
					isPublished: true
				}
			})
		}
	}

	const handleCardClick = (item: InProgressQuest) => {
		addState(
			"hashtags",
			(item?.metaData?.hashtags || []).map((h: string) => h.replace(/^#/, ""))
		)
		addState(
			"mentions",
			(item?.metaData?.mentions || []).map((m: string) => m.replace(/^@/, ""))
		)
		showCustomModal({
			customModalType: CREATE_MISSION_MODAL,
			tempCustomModalData: {
				...item,
				creatorQuestId: item._id,
				title: item?.questId?.name,
				identifier: item.identifier,
				description: item.description,
				ReadOnly: true
			}
		})
	}

	return (
		<section className="flex flex-col gap-6 mt-6">
			{isFetching ? (
				<InProgressCardSkeleton />
			) : questData && questData.length > 0 ? (
				questData.map((item: InProgressQuest) => (
					<InProgressCard
						heading={item?.questId?.name || "Post and Mention on Twitter"}
						icon={SocialIcons[item.identifier as keyof typeof SocialIcons]}
						date={moment(item?.createdAt).format("DD MMM YY | HH:mm")}
						description={item?.description}
						key={item?._id}
						isPublished={item.isPublished}
						onButtonClickHandler={() => handleClick(item)}
						onCardClickHandler={() => handleCardClick(item)}
					/>
				))
			) : (
				<NoDataFound />
			)}
		</section>
	)
}

export default InProgress
