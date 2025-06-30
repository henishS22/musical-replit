import { FC } from "react"

import { SubscriptionCardProps } from "@/types/subscription"
import { Button } from "@nextui-org/react"
import { Check, X } from "lucide-react"

const SubscriptionCard: FC<SubscriptionCardProps> = ({
	plan,
	onSelect,
	isSelected,
	offerDesc
}) => {
	const isFreeplan = plan?.planCode === "FREEMUSICAL"

	return (
		<div
			className={`max-w-[380px]
        px-6 py-[40px]
		h-full
        ${
					isSelected
						? "bg-[#DDF5E5] shadow-[0px_10px_25px_0px_#CCD9FF] rounded-md"
						: "border border-[#1DB954] rounded-md"
				}
      `}
		>
			{/* Title and Price Section */}
			<div className="flex flex-col gap-[40px]">
				<div className="flex flex-col gap-5">
					{/* Title and Description */}
					<div className="flex flex-col gap-[11px]">
						<h3 className="font-bold text-[22px] leading-[16px] text-textPrimary">
							{plan.name}
						</h3>
						<p className="font-manrope font-normal text-[16px] tracking-normal leading-[100%] text-textGray h-[48px]">
							{plan.description}
						</p>
					</div>

					{/* Price and Button */}
					<div
						className={`flex flex-col ${plan.planCode === "FREEMUSICAL" ? "gap-[43px]" : "gap-6"}`}
					>
						<div className="flex flex-col gap-1">
							<div className="flex items-center">
								<span className="font-manrope font-semibold text-[56px] leading-[100%] text-textPrimary">
									${plan.price}
								</span>
								<span className="font-manrope font-light text-[16px] leading-[100%] tracking-normal text-textGray ml-1">
									/{plan.interval.toLowerCase()}
								</span>
							</div>
							<div className="text-noteRed text-sm">{offerDesc}</div>
						</div>

						{!isFreeplan ? (
							<Button
								onPress={onSelect}
								disableAnimation
								isDisabled={isSelected}
								className={`w-full py-[11px] text-center font-semibold text-[16px] leading-[100%] rounded relative z-10 ${
									isSelected
										? "bg-white text-[#0D5326] cursor-not-allowed data-[disabled]:opacity-100"
										: "text-[#0D5326] before:absolute before:inset-0 before:rounded before:bg-gradient-to-b before:from-[#1DB954] before:to-[#0D5326] before:-z-10 before:content-[''] after:absolute after:inset-[1.5px] after:rounded after:bg-white after:-z-10"
								}`}
							>
								{isSelected ? "Current Plan" : "Get Started Now"}
							</Button>
						) : (
							<Button
								isDisabled
								disableAnimation
								className={`w-full py-[11px] text-center font-semibold text-[16px] leading-[100%] rounded relative z-10 ${
									isSelected
										? "bg-white text-[#0D5326] cursor-not-allowed data-[disabled]:opacity-100"
										: "text-[#0D5326] before:absolute before:inset-0 before:rounded before:bg-gradient-to-b before:from-[#1DB954] before:to-[#0D5326] before:-z-10 before:content-[''] after:absolute after:inset-[1.5px] after:rounded after:bg-white after:-z-10"
								}`}
							>
								Free Plan
							</Button>
						)}
					</div>
				</div>

				{/* Features List */}
				<div className="flex flex-col gap-3">
					{plan.features.map((feature) => (
						<div key={feature._id} className="flex items-center gap-[17px]">
							<div
								className={`
                p-1 rounded-full
                ${
									feature.available
										? isSelected
											? "bg-white"
											: "bg-videoBtnGreen"
										: "bg-hoverGray"
								}
              `}
							>
								{feature.available ? (
									<Check className="w-4 h-4 text-[#0D5326]" />
								) : (
									<X className="w-4 h-4 text-textPrimary" />
								)}
							</div>
							<span
								className={`
                 font-medium text-[16px] leading-[100%]
                ${feature.available ? "text-textPrimary" : "text-textGray"}
              `}
							>
								{feature.description}
							</span>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

export default SubscriptionCard
