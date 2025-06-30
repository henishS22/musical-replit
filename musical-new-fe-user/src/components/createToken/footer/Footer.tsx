import React from "react"
import Image from "next/image"

import { INFO_ICON } from "@/assets"
import { Button } from "@nextui-org/react"

const Footer: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
	return (
		<div className="flex flex-wrap justify-between items-center px-10 py-5 max-md:px-5 shadow-[inset_1px_0px_0px_0px_rgba(244,244,244,1)] bg-white">
			<div className="flex flex-wrap flex-1 gap-3 items-center text-sm font-semibold tracking-normal leading-4 text-black ">
				<Image
					loading="lazy"
					src={INFO_ICON}
					className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
					alt="info"
					width={24}
					height={24}
				/>
				<div className="flex-1 text-[#6F767E] font-semibold text-[13px] leading-[16px] tracking-[-0.01em] ">
					Each Step in this process can take several minutes while blockchain
					transactions are confirmed. Do not close your browser while
					transactions are pending, as progress will be lost. If you exit the
					page in between steps your progress wil be saved.
				</div>
			</div>
			<div className="flex flex-1 max-w-[120px] gap-2 items-start  text-base font-bold tracking-normal leading-relaxed text-black">
				<Button
					type="submit"
					disabled={isLoading}
					className="gap-2 px-5 py-3 rounded-xl bg-btnColor text-white disabled:opacity-50"
					isLoading={isLoading}
				>
					{isLoading ? "Minting..." : "Mint now"}
				</Button>
			</div>
		</div>
	)
}

export default Footer
