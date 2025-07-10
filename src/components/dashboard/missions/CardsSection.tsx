import { Quest } from "@/types/missionTypes"

import MissionCard from "./MissionsCard"

interface CardsSectionProps {
	type: "fan" | "creator"
	data: Quest[]
}

const CardsSection = ({ type, data }: CardsSectionProps) => {
	return (
		<div className="grid [grid-template-columns:repeat(auto-fill,_minmax(509px,_1fr))] gap-4">
			{data?.length &&
				data?.map((item, idx) => (
					<div className="flex basis-1/3" key={idx}>
						<MissionCard
							type={type}
							identifier={item.identifier}
							_id={item._id}
							title={item?.name}
							points={item.points}
							description={item.description}
							isAvailable={item.isAvailable}
						/>
					</div>
				))}
		</div>
	)
}

export default CardsSection
