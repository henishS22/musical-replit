"use client"

import React, { useEffect, useMemo } from "react"
import { useInView } from "react-intersection-observer"
import Image from "next/image"

import {
	fetchAppliedCollaborationsList,
	fetchCreateCollaborationsList
} from "@/app/api/query"
import { CALENDAR, UP_ARROW } from "@/assets"
import { NoDataFound } from "@/components/ui"
import { DashboardFilterModal } from "@/components/ui/dashboardFilterModal"
import { Skeleton } from "@/components/ui/skeleton"
import { FilterItem } from "@/components/ui/titleBadgeCard"
import { generateQueryParams } from "@/helpers"
import { CollaborationPostData } from "@/types/apiResponse"
import { Button, Spinner, useDisclosure } from "@nextui-org/react"
import { useInfiniteQuery } from "@tanstack/react-query"
import moment from "moment"

import { useUserStore } from "@/stores"

import { CollaborationPost } from "./CollaborationPost"

export interface CollaborationPostProps {
	title: string
	description: string
	tags: string[]
	attachedFiles: Array<{
		type: string
		title: string
		artist: string
		duration: string
		trackId: string
		artwork: string
		trackUrl: string
	}>
	name: string
	timeAgo: string
	status: string
	isFavorite: boolean
	avatarSrc: string
}

const transformCollaborationData = (
	data: CollaborationPostData,
	tab: string
): CollaborationPostProps => {
	if (tab === "applied") {
		return {
			title: data.songContest?.title || "",
			description: data.brief,
			tags: [
				...(data.songContest?.seeking || []).map((s) => s.title.en),
				...(data.songContest?.styles || []).map((s) => s.title.en)
			],
			attachedFiles: data.tracks.map((track) => ({
				type: track.extension,
				title: track.name,
				artist: data.user?.name || "",
				duration: track?.duration?.toString(),
				trackId: track._id,
				artwork: track.artwork,
				trackUrl: track.url
			})),
			name: data.songContest?.userId?.name || "",
			timeAgo: new Date(data.createdAt).toLocaleDateString(),
			status: moment().isAfter(data.songContest?.duration.endTo)
				? "Expired"
				: "Active",
			isFavorite: data.isFavorite || false,
			avatarSrc: data.songContest?.userId?.profile_img || ""
		}
	}

	// Original transformation for created collaborations
	return {
		title: data.title,
		description: data.brief,
		tags: [
			...data.seeking.map((s) => s.title.en),
			...data.styles.map((s) => s.title.en)
		],
		attachedFiles: data.tracks.map((track) => ({
			type: track.extension,
			title: track.name,
			artist: data.userId.name,
			duration: "0",
			trackId: track._id,
			artwork: track.artwork,
			trackUrl: track.url
		})),
		name: data.userId.name,
		timeAgo: new Date(data.createdAt).toLocaleDateString(),
		status: "Active",
		isFavorite: false,
		avatarSrc: data.userId.profile_img
	}
}

interface CollaborationPostsProps {
	tab: string
}

export const CollaborationPosts: React.FC<CollaborationPostsProps> = ({
	tab
}) => {
	const { userData } = useUserStore()
	const { ref: loadMoreRef, inView } = useInView()
	const { isOpen, onOpen, onOpenChange } = useDisclosure()

	const [filterValue, setFilterValue] = React.useState<FilterItem>({
		startDate: new Date(),
		endDate: new Date(),
		key: "selection"
	})

	const [startDate, setStartDate] = React.useState<string>("")
	const [endDate, setEndDate] = React.useState<string>("")

	const toggleFilter = () => {
		onOpen()
	}

	const handleConfirm = () => {
		const formatDate = (date: Date) => {
			return date.toLocaleDateString("en-CA")
		}

		const formattedStartDate = formatDate(new Date(filterValue.startDate))
		const formattedEndDate = formatDate(new Date(filterValue.endDate))
		setStartDate(formattedStartDate)
		setEndDate(formattedEndDate)

		onOpenChange()
	}

	const handleReset = () => {
		setFilterValue({
			startDate: new Date(),
			endDate: new Date(),
			key: "selection"
		})
		setStartDate("")
		setEndDate("")
	}

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } =
		useInfiniteQuery({
			queryKey: ["collaborations", tab, userData?._id, startDate, endDate],
			queryFn: ({ pageParam = 1 }) => {
				const queryParams = generateQueryParams({
					page: pageParam.toString(),
					limit: "10",
					startDate: startDate?.toString(),
					endDate: endDate?.toString()
				})

				if (tab === "applied") {
					return fetchAppliedCollaborationsList(queryParams)
				}
				return fetchCreateCollaborationsList(
					userData?._id as string,
					queryParams
				)
			},
			initialPageParam: 1,
			getNextPageParam: (lastPage, allPages) => {
				const totalItems = lastPage?.pagination?.total || 0
				const currentPage = allPages.length
				const nextPage = currentPage + 1
				return currentPage * 10 < totalItems ? nextPage : undefined
			},
			enabled: tab === "applied" || !!userData?._id
		})

	const collaborationPosts = useMemo(() => {
		return data?.pages.flatMap((page) => page?.collaborations ?? []) || []
	}, [data])

	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage()
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

	return (
		<div className="flex gap-6 items-start mt-8">
			<div className="flex flex-col flex-1 shrink w-full basis-0 min-w-[240px] max-md:max-w-full">
				<div className="flex flex-wrap gap-2 justify-end items-end w-full tracking-normal min-h-[40px] max-md:max-w-full">
					{collaborationPosts.length > 0 && (
						<div
							className="flex gap-2 items-center self-stretch p-2 my-auto font-medium tracking-normal bg-white rounded-lg border border-gray-500 border-solid text-neutral-700 cursor-pointer"
							onClick={toggleFilter}
						>
							<Image
								loading="lazy"
								src={CALENDAR}
								className="object-contain shrink-0 self-stretch my-auto w-4 aspect-square"
								alt="calendar"
								width={16}
							/>
							<div className="self-stretch my-auto">Date Added</div>
							<Image
								loading="lazy"
								src={UP_ARROW}
								className="object-contain shrink-0 self-stretch my-auto w-4 aspect-square"
								alt="up-arrow"
								width={16}
							/>
						</div>
					)}
					{(startDate || endDate) && (
						<Button
							className="px-5 py-[22px] bg-videoBtnGreen text-[#0D5326] font-bold rounded-lg"
							onPress={handleReset}
						>
							Reset Filter
						</Button>
					)}
				</div>

				<div className="flex flex-col mt-3 w-full max-md:max-w-full gap-5">
					{isPending ? (
						<div className="flex flex-col gap-4">
							{[...Array(3)].map((_, index) => (
								<Skeleton key={index} className="w-full h-[200px] rounded-lg" />
							))}
						</div>
					) : collaborationPosts.length > 0 ? (
						<>
							{collaborationPosts.map(
								(post: CollaborationPostData, index: number) => (
									<CollaborationPost
										key={index}
										{...transformCollaborationData(post, tab)}
										tab={tab}
									/>
								)
							)}
							<div ref={loadMoreRef}>
								{isFetchingNextPage && (
									<div className="flex items-center justify-center h-[50px] w-full">
										<Spinner />
									</div>
								)}
							</div>
						</>
					) : (
						<NoDataFound message="No collaboration found" />
					)}
				</div>
				{collaborationPosts.length > 0 && (
					<DashboardFilterModal
						isOpen={isOpen}
						onOpenChange={onOpenChange}
						selectedValue={filterValue}
						setSelectedValue={setFilterValue}
						handleConfirm={handleConfirm}
						handleReset={handleReset}
					/>
				)}
			</div>
		</div>
	)
}
