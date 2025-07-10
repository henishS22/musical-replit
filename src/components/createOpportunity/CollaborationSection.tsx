import Image from "next/image"

import { contestOptions } from "@/config"
import { useDynamicStore } from "@/stores"

import InfoSection from "./InfoSection"

export default function CollaborationSection() {
	const { CreateOpportunity, updateState } = useDynamicStore()

	const handleCollaborationSelect = (collaborationType: string) => {
		updateState("CreateOpportunity", {
			...CreateOpportunity,
			collaborationType: collaborationType
		})
	}

	return (
		<div className="w-full flex flex-col gap-6">
			<InfoSection
				title="Type of Collaboration"
				content="Select the type of project for fans to find collaboration on Guild "
			/>
			<div className="flex gap-6">
				{contestOptions.map((option) => (
					<div
						key={option.id}
						className="cursor-pointer"
						onClick={() => handleCollaborationSelect(option.id)}
					>
						{/* Wrapper for gradient border effect */}
						<div
							className={`p-[2px] rounded-lg transition-all ${
								CreateOpportunity.collaborationType === option.id
									? "bg-gradient-to-b from-[#1DB954] to-[#0D5326]"
									: "bg-transparent"
							}`}
						>
							<div
								className={`relative flex flex-col justify-center items-center gap-[10px] bg-white rounded-lg px-[20px] py-8 text-center border-2 transition-all ${
									CreateOpportunity.collaborationType === option.id
										? "border-transparent"
										: "border-hoverGray"
								}`}
							>
								<div className="bg-white p-4 rounded-xl">
									<Image
										src={option.icon}
										alt={option.title}
										width={60}
										height={60}
									/>
								</div>
								<h3 className="text-md font-bold text-[#0A1629] leading-6">
									{option.title}
								</h3>
								<p className="text-textGray text-[15px] leading-6">
									{option.description}
								</p>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
