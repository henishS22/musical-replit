import * as React from "react"
import { toast } from "react-toastify"
import Image, { StaticImageData } from "next/image"

import { START_ICON } from "@/assets"
import PointsBadge from "@/components/viewProfile/missions/PointsBadge"
import { CREATE_MISSION_MODAL } from "@/constant/modalType"
import { MISSION_STARTED } from "@/constant/toastMessages"
import { Button } from "@nextui-org/react"

import { useModalStore } from "@/stores"

interface MissionCardProps {
	icon: string | StaticImageData
	title: string
	points: number
	identifier: string
	description: string
	_id: string
	isAvailable: boolean
}

export function MissionCard({
	icon,
	title,
	points,
	identifier,
	description,
	_id,
	isAvailable
}: MissionCardProps) {
	const { showCustomModal } = useModalStore()
	const handleClick = () => {
		if (isAvailable) {
			showCustomModal({
				customModalType: CREATE_MISSION_MODAL,
				tempCustomModalData: {
					title: title,
					identifier: identifier,
					description: description,
					questId: _id
				}
			})
		} else {
			toast.error(MISSION_STARTED)
		}
	}
	return (
		<article className="flex justify-center items-start w-full max-md:max-w-full">
			<div
				className="flex flex-wrap flex-1 shrink gap-6 items-center p-3 w-full border-solid basis-0 bg-zinc-50 min-w-60 max-md:max-w-full border border-[#EFEFEF] rounded-[12px]
"
			>
				<Image
					src={icon}
					alt={`${title} icon`}
					className="object-contain shrink-0 my-auto w-6 aspect-square"
					width={24}
					height={24}
				/>
				<h2
					className="flex-1 shrink  my-auto text-base basis-8 min-w-60 max-md:max-w-full font-bold text-[16px] leading-[100%] tracking-[0%] text-[#1A1D1F]
"
				>
					{title}
				</h2>
				<PointsBadge points={points} />
				<Button
					onPress={handleClick}
					className="flex gap-2 justify-center items-center px-4 py-2 my-auto text-sm tracking-normal leading-6 text-green-500 whitespace-nowrap bg-green-100 rounded-lg"
				>
					<Image
						src={START_ICON}
						alt="Start icon"
						className="object-contain shrink-0 my-auto w-4 aspect-square"
						width={16}
						height={16}
					/>
					<span
						className=" my-auto text-[#1DB954] font-[Inter] font-bold text-[13px] leading-[24px] tracking-[-1%]
"
					>
						Start
					</span>
				</Button>
			</div>
		</article>
	)
}
