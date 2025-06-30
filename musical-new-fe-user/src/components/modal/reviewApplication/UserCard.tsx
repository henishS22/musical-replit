import React from "react"
import Image from "next/image"

import { PROFILE_IMAGE } from "@/assets"

const UserCard: React.FC<{
	brief: string
	profileId: string
	image: string
	name: string
	isFavorite: boolean
	isArchive: boolean
	applicationId: string
	handleClick: ({
		id,
		payload
	}: {
		id: string
		payload: Record<string, boolean>
	}) => void
}> = ({ brief, image, name }) => {
	return (
		<div className="flex flex-col mt-4 w-full text-black max-md:max-w-full">
			<div className="flex flex-wrap gap-10 justify-between items-center w-full text-sm font-bold tracking-tight max-md:max-w-full">
				<div className="flex gap-4 items-center self-stretch my-auto">
					<Image
						loading="lazy"
						src={image || PROFILE_IMAGE}
						className="object-contain shrink-0 self-stretch my-auto w-11 aspect-square"
						alt="Anubhav Dwivedi"
						width={44}
						height={44}
					/>
					<div className="self-stretch my-auto">{name}</div>
				</div>
			</div>
			<div className="mt-2 text-xs font-medium tracking-normal text-textGray">
				{brief}
			</div>
		</div>
	)
}

export default UserCard
