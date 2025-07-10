"use client"

import React from "react"

import { CoinflowEnvs, CoinflowPurchaseProtection } from "@coinflowlabs/react"
import { ThirdwebProvider } from "thirdweb/react"

import { coinFlowEnv, coinFlowMerchantId } from "@/config/config"

// Ensure the environment variables are properly set
const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID
const authDomain = process.env.NEXT_PUBLIC_BASE_URL

if (!clientId) {
	throw new Error("NEXT_PUBLIC_THIRDWEB_CLIENT_ID is not defined")
}

if (!authDomain) {
	throw new Error("NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN is not defined")
}

export const ThirdwebProviderWrapper: React.FC<{
	children: React.ReactNode
}> = ({ children }) => {
	return (
		<ThirdwebProvider>
			{children}{" "}
			<>
				<CoinflowPurchaseProtection
					merchantId={coinFlowMerchantId as string}
					coinflowEnv={coinFlowEnv as CoinflowEnvs}
				/>
			</>
		</ThirdwebProvider>
	)
}
