"use client"

import React from "react"
import { toast } from "react-toastify"
import { useRouter } from "next/dist/client/components/navigation"
import Image, { StaticImageData } from "next/image"

import { deleteSavedSongContest, saveSongContest } from "@/app/api/mutation"
import { FavouriteIcon, PROFILE_IMAGE } from "@/assets"
import { POST_OPPORTUNITY_MODAL } from "@/constant/modalType"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { useLibraryStore, useModalStore } from "@/stores"

import { SkillTag } from "./SkillTag"

interface Author {
	_id?: string
	name: string
	avatar: string | StaticImageData
}

interface OpportunityCardProps {
	author: Author
	title: string
	description: string
	skills: string[]
	date: string
	id: string
	isSaved: boolean
	projectId: string
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
	author,
	title,
	description,
	skills,
	date,
	id,
	isSaved,
	projectId
}) => {
	const { showCustomModal } = useModalStore()
	const { instruments } = useLibraryStore()
	const router = useRouter()

	const userSkill = instruments
		.filter((instrument) => skills.includes(instrument._id))
		.map((instrument) => instrument.title)

	const formattedDate = new Date(date).toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "long"
	})

	const queryClient = useQueryClient()

	const { mutate } = useMutation({
		mutationFn: (id: string) => saveSongContest({ songContestId: id }),
		onSuccess: () => {
			// toast.success("Opportunity saved successfully")
			queryClient.invalidateQueries({ queryKey: ["savedOpportunities"] })
			queryClient.invalidateQueries({ queryKey: ["opportunityList"] })
		},
		onError: () => {
			toast.error("Failed to save opportunity")
		}
	})

	const { mutate: unsaveMutation } = useMutation({
		mutationFn: (id: string) => deleteSavedSongContest(id),
		onSuccess: () => {
			// toast.success("Opportunity removed from saved")
			queryClient.invalidateQueries({ queryKey: ["savedOpportunities"] })
			queryClient.invalidateQueries({ queryKey: ["opportunityList"] })
		},
		onError: () => {
			toast.error("Failed to remove opportunity from saved")
		}
	})

	const handleSaveOpportunity = () => {
		if (isSaved) {
			unsaveMutation(id)
		} else {
			mutate(id)
		}
	}

	return (
		<div
			className="flex flex-col px-6 py-3 mb-4 max-w-full rounded-lg border border-solid border-zinc-100 w-full max-md:px-5 cursor-pointer"
			onClick={() => {
				showCustomModal({
					customModalType: POST_OPPORTUNITY_MODAL,
					tempCustomModalData: {
						contestId: id,
						projectId: projectId
					}
				})
			}}
		>
			<div className="flex flex-wrap gap-10 justify-between items-center w-full text-base font-bold tracking-normal text-zinc-900 ">
				<div
					className="flex gap-2 items-center self-stretch my-auto cursor-pointer"
					onClick={(e) => {
						e.stopPropagation()
						router.push(`/profile/${author?._id}`)
					}}
				>
					<Image
						src={author.avatar || PROFILE_IMAGE}
						alt={`profile`}
						className="object-contain shrink-0 self-stretch my-auto w-12 rounded-full aspect-square"
						height={48}
						width={48}
					/>
					<div className="self-stretch my-auto">{author.name}</div>
				</div>
				<div
					className="flex gap-2 items-center self-stretch my-auto"
					onClick={(e) => {
						e.stopPropagation()
						handleSaveOpportunity()
					}}
				>
					<FavouriteIcon isSaved={isSaved} />
				</div>
			</div>
			<div className="flex flex-col mt-3 w-full">
				<h2 className="text-base font-bold tracking-normal text-zinc-900 max-md:max-w-full">
					{title}
				</h2>
				<p className="mt-2 text-sm font-medium tracking-normal leading-6 text-gray-500 max-md:max-w-full">
					{description}
				</p>
			</div>
			<div className="flex flex-wrap gap-2 items-center mt-3 w-full">
				{userSkill.map((skill, index) => (
					<SkillTag key={index} skill={skill} />
				))}
			</div>
			<div className="mt-3 text-xs font-medium tracking-normal leading-6 text-gray-500">
				{formattedDate}
			</div>
		</div>
	)
}
