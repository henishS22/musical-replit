"use client"

import { useState } from "react"
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"

import {
	fetchCoinflowSessionToken,
	fetchSubscriptionsAddons,
	fetchSubscriptionsPlans
} from "@/app/api/query"
import { SUBSCRIPTION_ALERT_MODAL } from "@/constant/modalType"
import { PURCHASE_SUCCESSFULLY } from "@/constant/toastMessages"
import { SubscriptionPlan } from "@/types/subscription"
// import { EthWallet } from "@coinflowlabs/react"
import { Skeleton, Spinner } from "@nextui-org/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

// import { useActiveWallet } from "thirdweb/react"

import { useDynamicStore, useModalStore } from "@/stores"
import { useUserSubscriptionData } from "@/hooks/useUserSubscriptionData"

import SubscriptionModal from "../modal/subscriptionModal/SubscriptionModal"
import ALaCarteTableSkeleton from "../skeletons/AlaCarteSkeleton"
import SubscriptionCardSkeleton from "../skeletons/SubscriptionCardSkeleton"
import { ALaCarteTable } from "./ALaCarteTable"
import Coinflow from "./Coinflow"
import SubscriptionCard from "./SubscriptionCard"

// import { coinflowPayment } from "@/app/api/mutation"

export default function Subscription() {
	const queryClient = useQueryClient()
	const router = useRouter()
	const { addState } = useDynamicStore()
	const [selectedPlan, setSelectedPlan] = useState<string>("")
	const [showCoinflow, setShowCoinflow] = useState(false)
	const [lifetimePlanCode, setLifetimePlanCode] = useState<string>()
	const [planCode, setPlanCode] = useState<string>()
	const [subTotal, setSubTotal] = useState<{
		amount: number
		currency: string
	}>()
	const {
		userSubscriptionPlans: subscriptionCards,
		userSubscriptionAddons: subscriptionAddons
	} = useUserSubscriptionData()
	const { showCustomModal, hideCustomModal } = useModalStore()
	const [sessionKey, setSessionKey] = useState<string | null>(null)

	const { data: plansData, isLoading: plansLoading } = useQuery({
		queryKey: ["subscriptionPlans"],
		queryFn: fetchSubscriptionsPlans
	})

	const { data: addonsData, isLoading: addonsLoading } = useQuery({
		queryKey: ["subscriptionAddons"],
		queryFn: fetchSubscriptionsAddons
	})

	const { mutate: getSessionKey, isPending: isSessionKeyLoading } = useMutation(
		{
			mutationFn: () => fetchCoinflowSessionToken(),
			onSuccess: (data) => {
				if (data) {
					setSessionKey(data?.key as string)
					setShowCoinflow(true)
				}
			}
		}
	)

	const handlePlanSelect = (
		planId: string,
		planPrice: number,
		planCode: string,
		currency: string,
		addonId?: string
	) => {
		// Find the current active plan
		const currentPlan = subscriptionCards?.find(
			(sub) => !sub?.coinflow?.isCanceled
		)

		// Open alert modal if user is on a paid plan and trying to upgrade
		if (
			currentPlan &&
			currentPlan.subscriptionDetails.planCode !== "FREEMUSICAL"
		) {
			setSelectedPlan(planId)
			showCustomModal({
				customModalType: SUBSCRIPTION_ALERT_MODAL,
				tempCustomModalData: {
					title: "Change Subscription Plan",
					message: `Upgrading to the new plan will replace your current plan. Any remaining benefits from your existing plan will be lost, and no refunds will be issued for the unused period. Are you sure you want to proceed?`,
					confirmButtonText: "Confirm",
					onConfirm: () => {
						proceedWithPlanSelection(
							planId,
							planPrice,
							planCode,
							currency,
							addonId
						)
						hideCustomModal()
					}
				}
			})
		} else {
			proceedWithPlanSelection(planId, planPrice, planCode, currency, addonId)
		}
	}

	//proceed with plan selection
	const proceedWithPlanSelection = (
		planId: string,
		planPrice: number,
		planCode: string,
		currency: string,
		addonId?: string
	) => {
		setSelectedPlan(addonId || planId)

		const isLifetimePlan = planCode === "LIFETIMEPASS" || planId === "lifetime"

		if (isLifetimePlan) {
			setLifetimePlanCode(planCode)
			setSubTotal({ amount: planPrice, currency: currency })
		} else {
			setPlanCode(planCode)
		}

		// Fetch session key before showing Coinflow
		getSessionKey()
	}

	//handle payment success
	const handlePaymentSuccess = () => {
		toast.success(PURCHASE_SUCCESSFULLY)
		setShowCoinflow(false)
		queryClient.invalidateQueries({
			queryKey: ["subscriptionFeatureAvailability"]
		})
		queryClient.invalidateQueries({ queryKey: ["userData"] })
		addState("fromSubscription", true)
		router.push("/profile")
	}

	// Separate the GUILD_KIT plan and the rest
	const guildKitPlan = plansData?.find(
		(plan: SubscriptionPlan) => plan.planCode === "GUILD_KIT"
	)
	const otherPlans =
		plansData?.filter(
			(plan: SubscriptionPlan) => plan.planCode !== "GUILD_KIT"
		) || []

	// Calculate the middle index
	const middleIndex = Math.floor(otherPlans.length / 2)

	// Insert the GUILD_KIT plan in the middle, if it exists
	const orderedPlans = [...otherPlans]
	if (guildKitPlan) {
		orderedPlans.splice(middleIndex, 0, guildKitPlan)
	}

	return (
		<div className="bg-white rounded-lg p-6">
			{isSessionKeyLoading ? (
				<div className="flex justify-center h-[70vh] items-center">
					<Spinner className="rounded-lg" />
				</div>
			) : showCoinflow && sessionKey ? (
				<Coinflow
					sessionKey={sessionKey}
					lifetimePlanCode={lifetimePlanCode}
					planCode={planCode}
					planId={selectedPlan}
					subTotal={subTotal}
					onSuccess={handlePaymentSuccess}
				/>
			) : (
				<>
					{plansLoading ? (
						<Skeleton className="h-[40px] w-[600px] rounded-lg mb-12 mx-auto" />
					) : (
						<h1 className="text-center text-[40px] font-bold leading-[100%] mb-12">
							This is your platform, with powerful features built for you
						</h1>
					)}

					<div className="grid gap-6 max-w-[1600px] mx-auto place-items-center [grid-template-columns:repeat(auto-fit,_minmax(300px,_1fr))]">
						{plansLoading
							? Array(3)
									.fill(null)
									.map((_, i) => <SubscriptionCardSkeleton key={i} />)
							: orderedPlans.map((plan: SubscriptionPlan) => {
									return (
										<SubscriptionCard
											key={plan._id}
											offerDesc={
												plan.planCode === "GUILD_KIT"
													? "18% Savings with Bundle"
													: plan.planCode === "LIFETIMEPASS"
														? "Buy 10 months. Access Forever. GUILDED NFT"
														: ""
											}
											plan={plan}
											isSelected={
												subscriptionCards?.some(
													(sub) =>
														sub?.subscriptionId === plan?._id &&
														!sub?.coinflow?.isCanceled
												) ?? false
											}
											onSelect={() =>
												handlePlanSelect(
													plan._id,
													plan.price,
													plan.planCode,
													plan.currency
												)
											}
										/>
									)
								})}
					</div>

					{addonsLoading ? (
						<ALaCarteTableSkeleton />
					) : (
						<ALaCarteTable
							addonsData={addonsData || []}
							selectedAddons={
								subscriptionAddons
									?.filter((addon) => !addon.coinflow?.isCanceled)
									.map((addon) => addon.subscriptionId) ?? []
							}
						/>
					)}
				</>
			)}
			<SubscriptionModal handlePlanSelect={proceedWithPlanSelection} />
		</div>
	)
}
