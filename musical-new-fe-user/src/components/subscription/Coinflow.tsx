import {
	CoinflowEnvs,
	CoinflowPurchase,
	Currency,
	PaymentMethods,
	SettlementType
} from "@coinflowlabs/react"

import { coinFlowEnv, coinFlowMerchantId } from "@/config/config"
import { useUserStore } from "@/stores"

interface CoinflowComponentProps {
	planCode?: string
	planId?: string
	subTotal?: { amount: number; currency: string }
	onSuccess: () => void
	lifetimePlanCode?: string
	sessionKey: string
}

const CoinflowComponent: React.FC<CoinflowComponentProps> = ({
	planCode,
	planId,
	subTotal,
	onSuccess,
	lifetimePlanCode,
	sessionKey
}) => {
	const { user } = useUserStore()
	const isLifetimePlan = !!lifetimePlanCode

	return (
		<div className="h-[100vh]">
			<CoinflowPurchase
				settlementType={SettlementType.USDC}
				sessionKey={sessionKey}
				merchantId={coinFlowMerchantId}
				env={coinFlowEnv as CoinflowEnvs}
				blockchain={"base"}
				onSuccess={onSuccess}
				{...(isLifetimePlan
					? {
							subtotal: {
								cents: subTotal?.amount ? subTotal?.amount * 100 : 0,
								currency: subTotal?.currency as Currency
							}
						}
					: { planCode })}
				webhookInfo={{
					userId: user?.id,
					planCode: planCode || lifetimePlanCode,
					planId: planId
				}}
				chargebackProtectionData={[
					{
						productName: "Musical App",
						productType: "DLC",
						quantity: 1
					}
				]}
				allowedPaymentMethods={[PaymentMethods.card]}
			/>
		</div>
	)
}

export default CoinflowComponent
