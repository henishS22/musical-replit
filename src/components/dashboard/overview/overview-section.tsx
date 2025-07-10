import { overviewData } from "@/config"

import { CreateModal } from "../create-module/create-modal"
import { OverviewCard } from "./overview-card"

const getCardId = (modalType: string): string => {
	const cardTypes: Record<string, string> = {
		CREATE_MODULE_MODAL: "create-card",
		RELEASE_MODULE_MODAL: "release-card",
		PROMOTE_MODULE_MODAL: "promote-card",
		ENGAGE_MODAL: "engage-card",
		LIBRARY_MODULE_MODAL: "library-card",
		PROJECTS_MODULE_MODAL: "projects-card"
	}
	return cardTypes[modalType] || ""
}

export function OverviewSection() {
	return (
		<section className="space-y-4">
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
				{overviewData.map((item, index) => (
					<span key={index} id={getCardId(item.modalType)}>
						<OverviewCard
							key={index}
							title={item.title}
							description={item.description}
							icon={item.icon}
							iconHeight={item.iconHeight}
							iconWidth={item.iconWidth}
							actionText={item.actionText}
							bgColor={item.bgColor}
							index={index}
							modalType={item.modalType}
						/>
					</span>
				))}
			</div>
			<CreateModal />
		</section>
	)
}
