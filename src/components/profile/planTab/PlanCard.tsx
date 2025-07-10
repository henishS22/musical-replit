import * as React from "react"

import { Button } from "@nextui-org/react"

interface PlanCardProps {
	title: string
	description: string
	price: string
	nextPayment: string
	onCancel: () => void
	isLoading: boolean
	planCode?: string
}

export const PlanCard: React.FC<PlanCardProps> = ({
	title,
	description,
	price,
	nextPayment,
	onCancel,
	isLoading,
	planCode
}) => {
	return (
		<article className="flex flex-col items-end gap-4 w-full">
			<div className="flex flex-col items-start gap-4 w-full border px-6 py-3 rounded-lg border-solid border-[#F4F4F4] max-md:p-4 max-sm:p-3">
				<div className="flex flex-col items-start gap-2 w-full">
					<h3 className="text-[#1A1D1F] text-base font-bold leading-6 tracking-[-0.16px] max-sm:text-sm">
						{title}
					</h3>
					<p className="text-[#6F767E] text-base font-normal max-sm:text-sm">
						{description}
					</p>
					<p className="text-[#1A1D1F] text-base font-semibold max-sm:text-sm">
						{price}
					</p>
					<p className="text-[#6F767E] text-base font-normal max-sm:text-sm">
						{nextPayment}
					</p>
				</div>
				{planCode !== "FREEMUSICAL" && (
					<Button
						isLoading={isLoading}
						className="w-fit self-start bg-btnColor text-white px-4 py-2 rounded-lg text-[13px] hover:bg-btnColorHover leading-[24px] font-bold tracking-[-0.01em]"
						onPress={onCancel}
					>
						Cancel Autopay
					</Button>
				)}
			</div>
		</article>
	)
}
