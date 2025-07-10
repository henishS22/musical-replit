import { useUserStore } from "@/stores"
import { UserSubscriptionData } from "@/stores/user"

interface UseUserSubscriptionDataResult {
	userSubscriptionPlans: UserSubscriptionData[]
	userSubscriptionAddons: UserSubscriptionData[]
}

export function useUserSubscriptionData(): UseUserSubscriptionDataResult {
	const { userData } = useUserStore()

	const userSubscriptionPlans =
		userData?.userSubscription.filter(
			(item) => item.subscriptionDetails.type === "subscription"
		) || []

	const userSubscriptionAddons =
		userData?.userSubscription.filter(
			(item) => item.subscriptionDetails.type === "addon"
		) || []

	return {
		userSubscriptionPlans,
		userSubscriptionAddons
	}
}
