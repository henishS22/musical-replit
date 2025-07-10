import React from "react"
import Image, { StaticImageData } from "next/image"

import { ETH_ICON, POLYGON_ICON, SUBTRACT_ICON } from "@/assets"

interface ChainOption {
	name: string
	imageSrc: string | StaticImageData
}

const ChainSelector: React.FC = () => {
	const chainOptions: ChainOption[] = [
		{
			name: "Ethereum",
			imageSrc: ETH_ICON
		},
		{
			name: "Polygon",
			imageSrc: POLYGON_ICON
		}
	]

	return (
		<div className="flex flex-col mt-4 w-full text-sm font-semibold tracking-normal leading-6 max-md:max-w-full">
			<div className="flex flex-col items-start w-full max-md:max-w-full">
				<div className="flex gap-1 items-center lowercase">
					<div className="self-stretch my-auto">
						<span>Chain</span>
					</div>
					<Image
						src={SUBTRACT_ICON}
						className="object-contain shrink-0 self-stretch my-auto w-4 aspect-square"
						alt="info"
						width={48}
						height={48}
					/>
				</div>
				<div className="flex gap-4 items-start mt-3 whitespace-nowrap">
					{chainOptions.map((option, index) => (
						<button
							key={index}
							className={`flex overflow-hidden items-center pr-2 pl-1 bg-white rounded-lg ${
								index === 0 ? "border-2 border-green-100 border-solid" : ""
							}`}
						>
							<Image
								src={option.imageSrc}
								className={`object-contain shrink-0 self-stretch my-auto ${
									index === 0
										? "rounded aspect-square w-[52px]"
										: "aspect-[0.98] w-[51px]"
								}`}
								alt={`${option.name} logo`}
								width={48}
								height={48}
							/>
							<div className="self-stretch my-auto">{option.name}</div>
						</button>
					))}
				</div>
			</div>
		</div>
	)
}

export default ChainSelector
