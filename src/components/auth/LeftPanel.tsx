import { FC } from "react"
import Image, { StaticImageData } from "next/image"
import Link from "next/link"

import { LOGO_LIGHT } from "@/assets"

interface LeftPanelProps {
	bannerBg: StaticImageData
}

const LeftPanel: FC<LeftPanelProps> = ({ bannerBg }) => {
	return (
		<div className="flex-[35vw_1_1] relative flex">
			<div className="absolute z-1">
				<Image
					src={bannerBg}
					alt="auth-bg"
					className="object-cover h-screen w-screen"
					loading="lazy"
				/>
			</div>
			<div className="z-2 p-4 bg-[transparent] text-white relative self-center mx-auto w-[400px]">
				<Link href={`${process.env.NEXT_PUBLIC_MARKETING_SITE}`}>
					<Image
						src={LOGO_LIGHT}
						alt="auth-bg"
						className="object-cover mx-auto"
						width={300}
						height={60}
						loading="lazy"
					/>
				</Link>
				<div className="flex gap-2 mt-4 flex-col">
					<p className="text-center text-lg text-semibold uppercase">
						Play (music) to Earn
					</p>
					<p className="text-center mt-6 text-lg">
						Join our collaborative platform that is built for creators, by
						creators, to foster economic empowerment and unlock musical talent
						across the globe.
					</p>
				</div>
			</div>
		</div>
	)
}

export default LeftPanel
