import * as React from "react"
import Image from "next/image"

import { formatTime } from "@/helpers"
import { FileDisplayProps } from "@/types"

const FileDisplay: React.FC<FileDisplayProps> = ({
	fileName,
	duration,
	iconSrc,
	label,
	error,
	smallWaveformImage
}) => {
	return (
		<div className="flex flex-col mt-8 w-full">
			{label && (
				<label className="text-sm font-bold tracking-tight text-neutral-700">
					{label}
				</label>
			)}
			{fileName && (
				<div className="flex gap-3 items-center p-3 w-full bg-white rounded-lg border-2 border-solid border-zinc-100">
					<div className="flex flex-wrap flex-1 shrink gap-4 items-center self-stretch my-auto w-full basis-0 min-w-[240px]">
						<div className="flex-1 shrink self-stretch my-auto text-sm font-medium tracking-tight text-gray-500 basis-0">
							{fileName}
						</div>
					</div>
				</div>
			)}
			{smallWaveformImage && (
				<div className="flex gap-3 items-center p-3 w-full">
					<Image
						loading="lazy"
						src={iconSrc}
						alt="icon"
						className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
						width={24}
						height={24}
					/>
					<Image
						src={smallWaveformImage}
						alt="Small Waveform"
						width={500}
						height={200}
						className="w-[90%]"
					/>
					<div className="self-stretch my-auto text-base text-right text-neutral-400">
						{formatTime(duration)}
					</div>
				</div>
			)}
			{error && <p className="text-red-500 text-sm mt-2">{error}</p>}
		</div>
	)
}

export default FileDisplay
