import React from "react"

import { Button } from "@nextui-org/react"

interface MissionHeader {
	showAll: boolean
	onViewAll?: () => void
}

const MissionHeader: React.FC<MissionHeader> = ({ showAll, onViewAll }) => {
	return (
		<header className="flex flex-wrap gap-10 justify-between items-center w-full leading-relaxed max-md:max-w-full">
			<h2 className="self-stretch my-auto text-xl font-semibold tracking-tight text-zinc-900">
				Latest Missions
			</h2>
			{!showAll && (
				<div className="flex gap-2 items-start self-stretch my-auto text-base font-bold tracking-normal text-zinc-50">
					<Button
						type="button"
						className="px-5 py-3 gap-2 rounded-lg bg-btnColor text-white font-bold text-[15px]"
						onPress={onViewAll}
					>
						View All
					</Button>
				</div>
			)}
		</header>
	)
}

export default MissionHeader
