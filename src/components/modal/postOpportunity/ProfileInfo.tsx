import React from "react"
import { toast } from "react-toastify"
import Image, { StaticImageData } from "next/image"
import { useRouter } from "next/navigation"

import { deleteSavedSongContest, saveSongContest } from "@/app/api/mutation"
import { FavouriteIcon } from "@/assets"
import { useMutation, useQueryClient } from "@tanstack/react-query"

interface ProfileInfoProps {
	userName: string
	userImage: string | StaticImageData
	userId?: string
	isSaved: boolean
	id: string
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({
	userName,
	userImage,
	isSaved,
	id,
	userId
}) => {
	const queryClient = useQueryClient()
	const router = useRouter()

	const { mutate } = useMutation({
		mutationFn: (id: string) => saveSongContest({ songContestId: id }),
		onSuccess: (data) => {
			if (data) {
				toast.success("Opportunity saved successfully")
				queryClient.invalidateQueries({ queryKey: ["savedOpportunities"] })
				queryClient.invalidateQueries({ queryKey: ["opportunityList"] })
			}
		},
		onError: () => {
			toast.error("Failed to save opportunity")
		}
	})

	const { mutate: unsaveMutation } = useMutation({
		mutationFn: (id: string) => deleteSavedSongContest(id),
		onSuccess: (data) => {
			if (data) {
				toast.success("Opportunity removed from saved")
				queryClient.invalidateQueries({ queryKey: ["savedOpportunities"] })
				queryClient.invalidateQueries({ queryKey: ["opportunityList"] })
			}
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
		<div className="flex flex-wrap gap-10 justify-between items-center mt-4 w-full text-base font-bold tracking-normal max-w-[632px] text-zinc-900 max-md:max-w-full">
			<div
				className="flex gap-2 items-center self-stretch my-auto cursor-pointer"
				onClick={() => {
					router.push(`/profile/${userId}`)
				}}
			>
				<Image
					loading="lazy"
					src={userImage}
					className="object-contain shrink-0 self-stretch my-auto w-12 rounded-full aspect-square"
					alt={`Profile`}
					width={48}
					height={48}
				/>
				<div className="self-stretch my-auto">{userName}</div>
			</div>
			<div
				className="flex gap-2 items-center self-stretch my-auto cursor-pointer"
				onClick={(e) => {
					e.stopPropagation()
					handleSaveOpportunity()
				}}
			>
				<FavouriteIcon isSaved={isSaved} />
			</div>
		</div>
	)
}

export default ProfileInfo
