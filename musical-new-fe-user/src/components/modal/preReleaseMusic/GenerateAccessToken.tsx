import React from "react"

import { CROWDFUND_ICON, FAN_CLUB_ICON, TOKEN_ICON } from "@/assets"

import { FeatureCard, FeatureCardProps } from "./FeatureCard"

const features: FeatureCardProps[] = [
	{
		imageSrc: CROWDFUND_ICON,
		title: "Crowdfund A Project",
		description:
			"Help me record and market my new music on Guild, and get behind the scenes access to the process!",
		project: "crowdfund"
	},
	{
		imageSrc: FAN_CLUB_ICON,
		title: "Start A Fan Club",
		description:
			"Join my Fan Club on Guild for the first look at my work and come along for the ride!",
		project: "fan-club"
	},
	{
		imageSrc: TOKEN_ICON,
		title: "Create A Digital Collectible",
		description:
			"Shop limited edition collectibles with special perks from my tokens on Guild!",
		project: "digital-collectible"
	}
]

export const GenerateAccessToken: React.FC = () => {
	// const [selectedProject, setSelectedProject] = useState<string | null>(null)

	// const renderProjectSelection = () => {
	// 	switch (selectedProject) {
	// 		case "crowdfund":
	// 			return <ProjectSelectionCard />
	// 		case "fan-club":
	// 			return <ProjectSelectionCard />
	// 		case "digital-collectible":
	// 			return <ProjectSelectionCard />
	// 	}
	// }

	return (
		<div className="flex flex-col justify-center mx-auto my-6 text-center text-black rounded-lg max-w-[889px]">
			{/* {selectedProject ? (
				renderProjectSelection()
			) : ( */}
			<div className="flex flex-wrap gap-11 justify-center items-start w-full max-md:max-w-full">
				{features.map((feature, index) => (
					<FeatureCard
						key={index}
						// setSelectedProject={setSelectedProject}
						{...feature}
					/>
				))}
			</div>
			{/* )} */}
		</div>
	)
}
