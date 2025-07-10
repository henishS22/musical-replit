"use client"

// import { GroupedAddon } from "@/types/subscription"
import { useState } from "react"

import { SUBSCRIPTION_MODAL } from "@/constant/modalType"
import { Button, Radio, RadioGroup } from "@nextui-org/react"

import { useModalStore } from "@/stores/modal"

import CustomModal from "../CustomModal"

export default function SubscriptionModal({
	handlePlanSelect
}: {
	handlePlanSelect: (
		planId: string,
		planPrice: number,
		planCode: string,
		currency: string,
		addonId: string
	) => void
}) {
	const { customModalType, hideCustomModal, tempCustomModalData } =
		useModalStore()
	const [selectedPlan, setSelectedPlan] = useState<string>("monthly")

	const planOptions = tempCustomModalData?.addonData
		? [
				{
					id: "monthly",
					title: "Monthly",
					price: tempCustomModalData?.addonData.monthly?.price,
					planCode: tempCustomModalData?.addonData.monthly?.planCode,
					currency: tempCustomModalData?.addonData.monthly?.currency,
					addonId: tempCustomModalData?.addonData.monthly?._id
				},
				{
					id: "yearly",
					title: "Yearly",
					price: tempCustomModalData?.addonData.yearly?.price,
					planCode: tempCustomModalData?.addonData.yearly?.planCode,
					currency: tempCustomModalData?.addonData.yearly?.currency,
					addonId: tempCustomModalData?.addonData.yearly?._id
				},
				{
					id: "lifetime",
					title: "Lifetime",
					price: tempCustomModalData?.addonData.lifetime?.price,
					planCode: tempCustomModalData?.addonData.lifetime?.planCode,
					currency: tempCustomModalData?.addonData.lifetime?.currency,
					addonId: tempCustomModalData?.addonData.lifetime?._id
				}
			].filter((plan) => plan.price > 0)
		: []

	const handlePurchase = () => {
		const selectedAddon = planOptions?.find((plan) => plan.id === selectedPlan)
		if (selectedAddon) {
			hideCustomModal()
			handlePlanSelect(
				selectedAddon.id,
				selectedAddon.price,
				selectedAddon.planCode,
				selectedAddon.currency,
				selectedAddon.addonId
			)
		}
	}

	return (
		<CustomModal
			showModal={customModalType === SUBSCRIPTION_MODAL}
			onClose={hideCustomModal}
			title="Select Plan"
			modalBodyClass="max-w-[400px]"
		>
			<div className="p-6 space-y-[26px]">
				<p className="text-textPrimary font-bold text-[18px] leading-6">
					Select Plan
				</p>
				<RadioGroup
					defaultValue="monthly"
					onChange={(e) => setSelectedPlan(e.target.value)}
				>
					<div className="flex flex-col gap-[26px]">
						{planOptions.map((plan) => (
							<Radio
								key={plan.id}
								value={plan.id}
								classNames={{
									base: "max-w-full",
									labelWrapper: "w-full",
									label:
										"font-semibold text-[14px] leading-6 text-textPrimary w-full"
								}}
							>
								<div className="flex justify-between w-full">
									<span>{plan.title}</span>
									<span>${plan.price}</span>
								</div>
							</Radio>
						))}
					</div>
				</RadioGroup>
				<div className="w-full flex justify-end">
					<Button
						className="w-full bg-btnColor text-white font-semibold px-4 py-2 rounded-lg font-bold text-[13px] leading-6 max-w-fit"
						onPress={handlePurchase}
					>
						Purchase
					</Button>
				</div>
			</div>
		</CustomModal>
	)
}
