import { useRouter } from "next/navigation"

import { PURCHASE_SUBSCRIPTION_MODAL } from "@/constant/modalType"

import { useDynamicStore, useModalStore } from "@/stores"

import CustomModal from "../CustomModal"

const PurchaseSubscriptionModal = () => {
	const router = useRouter()
	const { hideCustomModal, customModalType } = useModalStore()
	const { removeState } = useDynamicStore()

	const handleUpgradeClick = () => {
		hideCustomModal()
		removeState("trackId")
		router.push("/subscription")
	}

	return (
		<CustomModal
			showModal={customModalType === PURCHASE_SUBSCRIPTION_MODAL}
			onClose={hideCustomModal}
			size="5xl"
			modalBodyClass="max-w-[540px] rounded-2xl"
		>
			<div className="p-8 rounded-2xl text-center">
				<div className="mb-6">
					{/* <Image
						src="/images/premium-lock.svg"
						alt="Premium Feature"
						className="w-20 h-20 mx-auto mb-4"
						width={80}
						height={80}
					/> */}
					<h2 className="text-2xl font-bold mb-2">Premium Feature</h2>
					<p className="text-gray-600 mb-4">
						This feature is exclusively available to our premium subscribers.
					</p>
				</div>

				<div className="bg-gray-50 p-4 rounded-lg mb-6">
					<ul className="text-left space-y-3">
						<li className="flex items-center">
							<svg
								className="w-5 h-5 text-green-500 mr-2"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M5 13l4 4L19 7"
								/>
							</svg>
							Access all premium features
						</li>
						<li className="flex items-center">
							<svg
								className="w-5 h-5 text-green-500 mr-2"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M5 13l4 4L19 7"
								/>
							</svg>
							Priority support
						</li>
						<li className="flex items-center">
							<svg
								className="w-5 h-5 text-green-500 mr-2"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M5 13l4 4L19 7"
								/>
							</svg>
							Advanced analytics
						</li>
					</ul>
				</div>

				<div className="space-y-4">
					<button
						onClick={handleUpgradeClick}
						className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
					>
						Upgrade Now
					</button>
					<button
						onClick={hideCustomModal}
						className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
					>
						Maybe Later
					</button>
				</div>
			</div>
		</CustomModal>
	)
}

export default PurchaseSubscriptionModal
