"use client"

import { useCallback, useMemo } from "react"
import { useSearchParams } from "next/navigation"

import {
	CartItemClassOmitted,
	CoinflowEnvs,
	CoinflowPurchase,
	Currency,
	PaymentMethods,
	SettlementType
} from "@coinflowlabs/react"

import { coinFlowEnv, coinFlowMerchantId } from "@/config/config"

const NativeSubscriptions = () => {
	const searchParams = useSearchParams()

	// Extract params
	const sessionKey = searchParams.get("sessionKey") || ""
	const planType = searchParams.get("planType") || undefined
	const planCode = searchParams.get("planCode") || undefined
	const planId = searchParams.get("planId") || undefined
	const amount = searchParams.get("amount")
	const currency = searchParams.get("currency") || undefined
	const userId = searchParams.get("userId") || undefined

	// Determine if this is a lifetime plan
	const isLifetimePlan = planType === "lifetime"

	// subtotal for lifetime plan
	const subtotal = useMemo(() => {
		if (isLifetimePlan && amount && currency) {
			return {
				cents: Number(amount) * 100,
				currency: currency as Currency
			}
		}
		return undefined
	}, [isLifetimePlan, amount, currency])

	// Success handler
	const onSuccess = useCallback(() => {
		if (
			typeof window !== "undefined" &&
			window.ReactNativeWebView &&
			typeof window.ReactNativeWebView.postMessage === "function"
		) {
			window.ReactNativeWebView.postMessage("closeWebView")
		}
	}, [])

	// Prepare webhookInfo
	const webhookInfo = {
		userId,
		planCode,
		planId
	}

	// Prepare chargebackProtectionData
	const chargebackProtectionData: CartItemClassOmitted[] = [
		{
			productName: "Musical App",
			productType: "DLC",
			quantity: 1
		}
	]

	return (
		<div className="min-h-[100vh] h-[100vh]">
			<CoinflowPurchase
				settlementType={SettlementType.USDC}
				sessionKey={sessionKey}
				merchantId={coinFlowMerchantId}
				env={coinFlowEnv as CoinflowEnvs}
				blockchain={"base"}
				onSuccess={onSuccess}
				{...(isLifetimePlan ? { subtotal } : { planCode })}
				webhookInfo={webhookInfo}
				chargebackProtectionData={chargebackProtectionData}
				allowedPaymentMethods={[PaymentMethods.card]}
			/>
		</div>
	)
}

export default NativeSubscriptions
