import { toast } from "react-toastify"
import { useRouter } from "next/navigation"

import { LOGIN_FIRST } from "@/constant/toastMessages"
import { Button, Card, CardBody, CardFooter, Image } from "@nextui-org/react"
import { format } from "date-fns"

import { useUserStore } from "@/stores"

import LockedCard from "../LockedCard"

interface StreamCardProps {
	signature: string
	title: string
	description: string
	artworkUrl: string
	scheduleDate: string
	status: string
	streamId: string
}

export const StreamCard: React.FC<StreamCardProps> = ({
	signature,
	title,
	description,
	artworkUrl,
	scheduleDate,
	status,
	streamId
}) => {
	const router = useRouter()
	const { user } = useUserStore()
	return (
		<Card className="w-full rounded-lg shadow-none border border-[rgba(0,0,0,0.1)] flex flex-col gap-3">
			<CardBody className="flex flex-col gap-3">
				<div className="text-sm font-semibold text-textPrimary">
					{title}
					{status === "live" && (
						<div className="absolute top-3 right-3 flex items-center gap-1 bg-white rounded-lg px-2 py-1">
							<span className="w-2 h-2 rounded-full bg-red-500"></span>
							<span className="text-xs font-semibold text-textPrimary">
								Live
							</span>
						</div>
					)}
				</div>
				<p className="text-xs text-textPrimary font-semibold">
					{scheduleDate && !isNaN(new Date(scheduleDate).getTime())
						? format(new Date(scheduleDate), "dd MMMM yyyy, 'at' hh:mm a")
						: "Invalid date"}
				</p>
				{signature ? (
					<div className="flex gap-3 bg-hoverGray p-3 rounded-lg">
						<Image
							alt={title}
							className="w-full h-[100px] object-cover"
							src={artworkUrl}
							width={100}
							height={100}
						/>
						<div>
							<h4 className="text-[#1A1D1F] text-lg font-semibold mb-2">
								{title}
							</h4>
							<div
								className="text-[#6F767E] text-sm mb-2"
								dangerouslySetInnerHTML={{ __html: description }}
							/>
						</div>
					</div>
				) : (
					<LockedCard label={title} type="Live Stream" />
				)}
			</CardBody>
			{signature && (
				<CardFooter className="flex flex-col items-start px-3 pt-0 pb-3">
					<Button
						className="bg-btnColor hover:bg-btnColor text-white font-bold text-base py-2 px-5 rounded-lg"
						isDisabled={status !== "live"}
						onPress={() => {
							if (!user) {
								toast.error(LOGIN_FIRST)
								return
							} else {
								router.push(`/view-livestream/${streamId}`)
							}
						}}
					>
						Start Now
					</Button>
				</CardFooter>
			)}
		</Card>
	)
}
