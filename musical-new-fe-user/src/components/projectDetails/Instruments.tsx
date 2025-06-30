"use client"

import React from "react"
import Image from "next/image"

import { useDynamicStore } from "@/stores"

const Instruments = () => {
	const { projectInstruments } = useDynamicStore()

	return (
		<div className="flex flex-col py-4 pr-3.5 pl-4 mt-4 w-full rounded-lg border-2 border-solid border-neutral-100">
			<div className="gap-4 self-start text-sm font-bold tracking-normal leading-6 whitespace-nowrap text-zinc-900">
				Instruments
			</div>
			<div className="flex gap-3 items-start mt-3 flex-wrap">
				{projectInstruments?.length > 0 ? (
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					projectInstruments?.map((instrument: any, index: number) => (
						<div
							key={index}
							className={`flex gap-0.5 items-center py-0.5 pr-2 pl-1 text-xs font-medium tracking-normal whitespace-nowraprounded text-stone-950`}
						>
							<div
								className={`flex gap-2.5 justify-center items-center self-stretch my-auto w-6 h-6  rounded-sm min-h-[24px]`}
							>
								<Image
									src={`${process.env.NEXT_PUBLIC_INSTRUMENT_ICON_BASE_URL || "https://backend.guildtogether.com"}/${instrument?.icon}`}
									alt={instrument?.name}
									width={24}
									height={24}
								/>
							</div>
							<div className="self-stretch my-auto p-1">
								{instrument?.instrument}
							</div>
						</div>
					))
				) : (
					<p className="gap-4 self-stretch mt-3 w-full text-xs font-medium tracking-normal text-gray-500">
						No instruments found.
					</p>
				)}
			</div>
		</div>
	)
}

export default Instruments
