"use client"

import React, { useEffect, useMemo } from "react"
import { useInView } from "react-intersection-observer"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"

import { addTracksToProject } from "@/app/api/mutation"
import { fetchProjectTracks } from "@/app/api/query"
import { CALENDAR, DOWN_ARROW, NO_PROJECT, UP_ARROW } from "@/assets"
import SelectTrackModal from "@/components/modal/selectTrackModal"
import { SELECT_TRACK } from "@/constant/modalType"
import { generateQueryParams } from "@/helpers"
import { IApiResponseData } from "@/types/apiResponse"
import { fetchTrack } from "@/types/createOpportunityTypes"
import { Skeleton, Spinner, useDisclosure } from "@nextui-org/react"
import {
	useInfiniteQuery,
	useMutation,
	useQueryClient
} from "@tanstack/react-query"

import { useDynamicStore, useModalStore } from "@/stores"

import AudioPlayer from "../trackPlayer"
import { DashboardFilterModal } from "../ui/dashboardFilterModal"
import MultiDropdown from "../ui/dropdown/MultiDropdown"
import { FilterItem } from "../ui/titleBadgeCard"

function ProjectFiles({ permission }: { permission: string }) {
	const { id } = useParams()

	const { addState, removeState } = useDynamicStore()
	const router = useRouter()
	const { showCustomModal1 } = useModalStore()
	const { isOpen, onOpen, onOpenChange } = useDisclosure()

	const toggleFilter = () => {
		onOpen()
	}

	const [filterValue, setFilterValue] = React.useState<FilterItem>({
		startDate: new Date(),
		endDate: new Date(),
		key: "selection"
	})

	const [startDate, setStartDate] = React.useState<string>("")
	const [endDate, setEndDate] = React.useState<string>("")

	const handleConfirm = () => {
		const formatDate = (date: Date) => {
			return date.toLocaleDateString("en-CA") // en-CA gives YYYY-MM-DD format
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

	const queryClient = useQueryClient()

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } =
		useInfiniteQuery({
			queryKey: ["projectTracks", id, startDate, endDate],
			queryFn: ({ pageParam = 1 }) => {
				return fetchProjectTracks(
					id as string,
					generateQueryParams({
						page: pageParam.toString(),
						limit: "10",
						startDate: startDate?.toString(),
						endDate: endDate?.toString()
					})
				)
			},
			initialPageParam: 1,
			getNextPageParam: (lastPage, allPages) => {
				const totalItems = lastPage?.pagination?.totalCount || 0
				const currentPage = allPages.length
				const nextPage = currentPage + 1
				return currentPage * 4 < totalItems ? nextPage : undefined // Using 4 since limit is "4"
			},
			staleTime: 300000
		})

	const projectTracks = useMemo(() => {
		return data?.pages.flatMap((page) => page?.tracks ?? []) || [] // Flattening all pages
	}, [data])

	const { ref: loadMoreRef, inView } = useInView()

	const filterOptions = [
		{
			key: "link",
			label: "Link Library Files",
			onClick: () => {
				showCustomModal1({
					customModalTypeOne: SELECT_TRACK,
					tempCustomModalData1: { label: "Link Existing Files" }
				})
			}
		},
		{
			key: "upload",
			label: "Upload New Files",
			onClick: () => {
				removeState("trackId")
				removeState("isReleaseTrack")
				addState("linkTrack", id as string)
				removeState("trackFiles")
				router.push("/upload-new-work")
			}
		}
	]

	const { mutate } = useMutation({
		mutationFn: (tracks: fetchTrack[]) => {
			return addTracksToProject({
				projectId: id as string,
				trackIds: tracks.map((track) => track._id)
			})
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["projectTracks"]
			})
		}
	})
	const handleSubmit = (tracks: fetchTrack[]) => {
		mutate(tracks)
	}

	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage() // Fetch next page when the element is in view
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

	useEffect(() => {
		const instrument = projectTracks?.[0]?.instrument
		addState("projectInstruments", instrument)
		// addState("firstTrackinDetails", projectTracks?.[0])
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectTracks])

	return (
		<div className="flex flex-wrap gap-10 justify-between items-center mt-6 w-full max-w-[678px] min-h-[40px] max-md:max-w-full">
			<div className="gap-4 self-stretch my-auto text-xl font-bold tracking-normal leading-tight min-w-[240px] text-zinc-900 w-[283px]">
				Project Files
			</div>
			<div className="flex gap-3 items-center self-stretch my-auto text-sm leading-6 min-w-[240px]">
				<div
					className="flex gap-2 justify-center items-center self-stretch p-2 my-auto font-medium tracking-normal bg-white rounded-lg border border-gray-500 border-solid text-neutral-700 cursor-pointer"
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
				{(permission === "OWNER" ||
					permission === "UPLOAD/DOWNLOAD" ||
					permission === "UPLOAD_ONLY") && (
					<MultiDropdown
						dropdownLabel={
							<button className="flex gap-2 justify-center items-center self-stretch px-4 py-2 my-auto font-bold tracking-normal bg-green-100 rounded-lg text-slate-500">
								<div className="self-stretch my-auto">Add File</div>
								<Image
									loading="lazy"
									src={DOWN_ARROW}
									className="object-contain shrink-0 self-stretch my-auto w-4 aspect-square"
									alt="down-arrow"
									width={16}
								/>
							</button>
						}
						options={filterOptions}
						className={{
							item: "flex flex-col gap-2 p-3"
						}}
					/>
				)}
			</div>
			<div className="w-full h-[500px] overflow-x-hidden overflow-y-auto flex flex-col gap-4">
				{projectTracks && projectTracks?.length > 0 ? (
					projectTracks?.map((track: IApiResponseData) => (
						<div key={track._id} className="w-full flex flex-col gap-2">
							<AudioPlayer
								track={track}
								title={track.name}
								artist={track.user.name}
								audioUrl={track?.url}
								coverImage={track?.artwork}
								extension={track.extension}
								trackId={track._id}
								trackComment={track.trackComments}
								permission={permission}
							/>
						</div>
					))
				) : isPending ? (
					<div className="w-full space-y-4">
						{Array.from({ length: 3 }).map((_, index) => (
							<Skeleton key={index} className="w-full h-[139px] rounded-lg" />
						))}
					</div>
				) : (
					<div className="w-full flex flex-col items-center justify-center">
						<Image src={NO_PROJECT} alt="no project" />
						<div className="font-medium text-[20px] leading-[24px] tracking-[-0.01em] text-center">
							No tracks in the project yet
						</div>
					</div>
				)}
				<div ref={loadMoreRef}>
					{isFetchingNextPage && (
						<div className="flex items-center justify-center h-[50px] w-full">
							<Spinner />
						</div>
					)}
				</div>
			</div>
			<SelectTrackModal onSubmit={handleSubmit} initialData={[]} />
			<DashboardFilterModal
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				selectedValue={filterValue}
				setSelectedValue={setFilterValue}
				handleConfirm={handleConfirm}
				handleReset={handleReset}
			/>
		</div>
	)
}

export default ProjectFiles
