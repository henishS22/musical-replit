import React from "react"
import { toast } from "react-toastify"
import Image from "next/image"

import { START_ICON } from "@/assets"
import PointsBadge from "@/components/viewProfile/missions/PointsBadge"
import { CREATE_MISSION_MODAL, MISSIONS_MODAL } from "@/constant/modalType"
import { MISSION_PERFORMED } from "@/constant/toastMessages"
import { MissionsIconMap } from "@/helpers"
import { Button } from "@nextui-org/react"
import { ArrowRight } from "lucide-react"

import { useModalStore } from "@/stores"

type MissionCardProps = {
	type: "fan" | "creator"
	title: string
	points: number
	description?: string
	identifier: string
	_id: string
	isAvailable?: boolean
}

const MissionCard: React.FC<MissionCardProps> = ({
	type,
	title,
	points,
	description,
	identifier,
	_id,
	isAvailable
}) => {
	const { showCustomModal } = useModalStore()

	const handleClick = () => {
		if (type === "fan") {
			if (!isAvailable) return toast.error(MISSION_PERFORMED)
			return showCustomModal({
				customModalType: MISSIONS_MODAL,
				tempCustomModalData: {
					title: title,
					identifier: identifier,
					description: description,
					questId: _id,
					post_url: identifier === "connect_instagram"
				}
			})
		} else {
			if (!isAvailable) return toast.error(MISSION_PERFORMED)
			return showCustomModal({
				customModalType: CREATE_MISSION_MODAL,
				tempCustomModalData: {
					title: title,
					identifier: identifier,
					description: description,
					questId: _id
				}
			})
		}
	}

	return (
		<div className="flex flex-col gap-4 justify-between bg-white rounded-lg border border-customGray p-5 mb-4 w-full">
			<div className="flex flex-col gap-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-6">
						<span className="max-w-[24px] max-h-[24px]">
							{MissionsIconMap[identifier]}
						</span>
						<span className="font-bold text-lg text-textPrimary">{title}</span>
					</div>
					{type === "fan" && (
						<span onClick={handleClick} className="cursor-pointer">
							<ArrowRight color="#1DB954" />
						</span>
					)}
				</div>

				<div className="flex justify-between items-end gap-2">
					{type === "fan" && description && (
						<div className="text-gray-500 text-sm mt-1 max-w-[70%]">
							{description}
						</div>
					)}
					<span
						className={`flex justify-between items-center ${type !== "fan" ? "w-full" : ""}`}
					>
						<PointsBadge points={points} />
						{type === "creator" && (
							<Button
								onPress={handleClick}
								className="flex gap-2 justify-center items-center self-stretch cursor-pointer px-4 py-2 my-auto text-sm tracking-normal leading-6 text-green-500 whitespace-nowrap bg-green-100 rounded-lg "
							>
								<Image
									src={START_ICON}
									alt="Start icon"
									className="object-contain shrink-0 self-stretch my-auto w-4 aspect-square"
									width={16}
									height={16}
								/>
								<span className="self-stretch my-auto text-green-500">
									Start
								</span>
							</Button>
						)}
					</span>
				</div>
			</div>
		</div>
	)
}

export default MissionCard
