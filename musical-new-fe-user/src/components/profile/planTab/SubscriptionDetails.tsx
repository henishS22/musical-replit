import * as React from "react"
import { useState } from "react"
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"

import { cancelSubscription } from "@/app/api/mutation"
import { SUBSCRIPTION_ALERT_MODAL } from "@/constant/modalType"
import { AUTOPAY_CANCELLED_SUCCESSFULLY } from "@/constant/toastMessages"
import { Button } from "@nextui-org/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { useActiveWallet } from "thirdweb/react"

import { useModalStore } from "@/stores/modal"
import { useUserSubscriptionData } from "@/hooks/useUserSubscriptionData"

import { PlanCard } from "./PlanCard"

export const SubscriptionDetails: React.FC = () => {
	const queryClient = useQueryClient()
	const activeWallet = useActiveWallet()
	const walletAddress = activeWallet?.getAccount()?.address
	const { showCustomModal, hideCustomModal } = useModalStore()
	const { userSubscriptionPlans, userSubscriptionAddons } =
		useUserSubscriptionData()
	const router = useRouter()
	const [loadingSubscriptionId, setLoadingSubscriptionId] = useState<
		string | null
	>(null)

	const { mutate: cancelSubscriptionMutation } = useMutation({
		mutationFn: ({
			subscriptionId,
			wallet
		}: {
			subscriptionId: string
			wallet: string
		}) => cancelSubscription(subscriptionId, wallet),
		onMutate: (variables) => {
			setLoadingSubscriptionId(variables.subscriptionId)
		},
		onSuccess: (data) => {
			if (data) {
				toast.success(AUTOPAY_CANCELLED_SUCCESSFULLY)
				queryClient.invalidateQueries({ queryKey: ["userData"] })
			}
			setLoadingSubscriptionId(null)
		},
		onError: () => {
			setLoadingSubscriptionId(null)
		}
	})

	const handleCancelPlan = (subscriptionId: string) => {
		if (!subscriptionId || !walletAddress)
			return toast.error("Subscription ID or wallet address is missing")
		showCustomModal({
			customModalType: SUBSCRIPTION_ALERT_MODAL,
			tempCustomModalData: {
				confirmButtonText: "Cancel Subscription",
				title: "Cancel Subscription",
				message:
					"Are you sure you want to cancel this subscription You will lose access to all the features and not get any refund?",
				onConfirm: () => {
					cancelSubscriptionMutation({
						subscriptionId: subscriptionId,
						wallet: walletAddress
					})
					hideCustomModal()
				}
			}
		})
	}

	const formatNextPayment = (
		nextBillingDate: string,
		price: number,
		interval: string
	) => {
		if (!nextBillingDate || !price || !interval) {
			return "Payment information unavailable"
		}
		try {
			return `Next Payment on ${format(new Date(nextBillingDate), "do MMMM yyyy 'at' hh:mm a")} for $${price} ${interval}`
		} catch (error) {
			console.error("Date formatting error:", error)
			return "Payment date unavailable"
		}
	}

	const handleRedirectToSubscription = () => {
		router.push("/subscription")
	}

	// Filtering out canceled plans and addons
	const activePlans = userSubscriptionPlans.filter(
		(plan) => !plan?.coinflow?.isCanceled
	)
	const activeAddons = userSubscriptionAddons.filter(
		(addon) => !addon?.coinflow?.isCanceled
	)

	return (
		<main className="flex flex-col items-start gap-6 flex-[1_0_0] max-md:px-4 max-md:py-0 max-sm:px-3 max-sm:py-0">
			<section className="flex flex-col items-start gap-3 flex-[1_0_0] w-full">
				<header className="flex h-10 flex-col justify-between items-start w-full">
					<h2 className="text-[#1A1D1F] text-xl font-bold leading-6 tracking-[-0.2px] gap-4 max-sm:text-lg">
						My Subscription Plan Details
					</h2>
				</header>

				{activePlans.length > 0 ? (
					activePlans.map((plan) => (
						<PlanCard
							key={plan?._id}
							title={plan?.subscriptionDetails?.name}
							description={plan?.subscriptionDetails?.description}
							price={`$${plan?.subscriptionDetails?.price}/${plan?.subscriptionInterval}`}
							nextPayment={formatNextPayment(
								plan?.endDate,
								plan?.subscriptionDetails?.price,
								plan?.subscriptionInterval
							)}
							onCancel={() => handleCancelPlan(plan?.coinflow?.subscriptionId)}
							isLoading={
								loadingSubscriptionId === plan?.coinflow?.subscriptionId
							}
							planCode={plan?.subscriptionDetails?.planCode}
						/>
					))
				) : (
					<div className="flex flex-col items-center gap-3 w-full justify-center h-[200px]">
						<p className="text-sm text-gray-500 text-center">
							No subscription plans available.
						</p>
						<Button
							onPress={handleRedirectToSubscription}
							className="w-fit bg-btnColor text-white px-4 py-2 rounded-lg text-[13px] hover:bg-btnColorHover leading-[24px] font-bold tracking-[-0.01em]"
						>
							Explore Plans
						</Button>
					</div>
				)}
			</section>

			<section className="flex flex-col items-start gap-3 flex-[1_0_0] w-full">
				<header className="flex h-10 flex-col justify-between items-start w-full">
					<h2 className="text-[#1A1D1F] text-xl font-bold leading-6 tracking-[-0.2px] gap-4 max-sm:text-lg">
						Plan Upgrade Details
					</h2>
				</header>

				{activeAddons.length > 0 ? (
					activeAddons.map((addon) => (
						<PlanCard
							key={addon?._id}
							title={addon?.subscriptionDetails?.name}
							description={addon?.subscriptionDetails?.description}
							price={`$${addon?.subscriptionDetails?.price}/${addon?.subscriptionInterval}`}
							nextPayment={formatNextPayment(
								addon?.endDate,
								addon?.subscriptionDetails?.price,
								addon?.subscriptionInterval
							)}
							onCancel={() => handleCancelPlan(addon?.coinflow?.subscriptionId)}
							isLoading={
								loadingSubscriptionId === addon?.coinflow?.subscriptionId
							}
						/>
					))
				) : (
					<div className="flex flex-col items-center gap-3 w-full justify-center h-[200px]">
						<p className="text-sm text-gray-500 text-center">
							No plan upgrade details available.
						</p>
						<Button
							onPress={handleRedirectToSubscription}
							className="w-fit bg-btnColor text-white px-4 py-2 rounded-lg text-[13px] hover:bg-btnColorHover leading-[24px] font-bold tracking-[-0.01em]"
						>
							Explore Plans
						</Button>
					</div>
				)}
			</section>
		</main>
	)
}
