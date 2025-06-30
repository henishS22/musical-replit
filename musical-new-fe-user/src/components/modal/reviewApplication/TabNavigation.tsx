import React from "react"

const TabNavigation: React.FC<{
	activeTab: string
	setActiveTab: (tab: string) => void
}> = ({ activeTab, setActiveTab }) => {
	return (
		<div className="flex flex-wrap gap-10 justify-between items-center mt-4 w-full text-xs font-semibold tracking-normal max-md:max-w-full">
			<div className="flex items-center self-stretch my-auto text-black">
				{["All Applications", "Favorite", "Archive"].map((tab) => (
					<div
						key={tab}
						className={`gap-2 self-stretch p-2 my-auto whitespace-nowrap border-b-2 transition-all duration-300 cursor-pointer ${
							activeTab === tab
								? "border-b-green-500 text-[#33383F]"
								: "border-b-transparent text-textGray"
						}`}
						onClick={() => setActiveTab(tab)}
					>
						{tab}
					</div>
				))}
			</div>
		</div>
	)
}

export default TabNavigation
