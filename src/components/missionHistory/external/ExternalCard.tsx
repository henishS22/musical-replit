import * as React from "react"
import Image, { StaticImageData } from "next/image"

import { PROFILE_IMAGE } from "@/assets"
import PointsBadge from "@/components/viewProfile/missions/PointsBadge"
import moment from "moment"

interface ExternalCardProps {
	icon: string | StaticImageData
	title: string
	points: number
	createdAt: string
	user_img?: string
	user_name?: string
}

export function ExternalCard({
	icon,
	title,
	points,
	createdAt,
	user_img,
	user_name
}: ExternalCardProps) {
	return (
		<article className="flex justify-center items-start w-full max-md:max-w-full">
			<div className="flex flex-wrap justify-between flex-1 shrink gap-6 items-center p-3 w-full rounded-xl border border-solid basis-0 bg-zinc-50 border-zinc-100 min-w-60 max-md:max-w-full">
				<div className="flex gap-10">
					<span className="flex gap-6">
						<Image
							src={icon}
							alt={`social icon`}
							className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
							width={24}
							height={24}
						/>
						<h2 className="flex-1 shrink self-stretch my-auto text-base basis-8 min-w-60 max-md:max-w-full font-bold text-[16px] leading-[100%] tracking-[0%] text-[#1A1D1F]">
							{title}
						</h2>
					</span>
					{user_name && (
						<span className="flex gap-2">
							<Image
								src={user_img || PROFILE_IMAGE}
								alt={`${title} icon`}
								className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square rounded-full"
								width={34}
								height={34}
							/>
							<h2 className="flex-1 shrink self-stretch my-auto text-base basis-8 min-w-60 text-zinc-900 max-md:max-w-full">
								{user_name || "N/A"}
							</h2>
						</span>
					)}
				</div>
				<div className="flex items-center gap-6">
					<PointsBadge points={points} />
					<div className="font-medium text-[14px] leading-[100%] tracking-[-2%] text-[#949494]">
						{moment(createdAt).format("DD MMM YY | HH:mm")}
					</div>
				</div>
			</div>
		</article>
	)
}
