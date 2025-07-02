"use client"

import { useEffect, useState } from "react"
import { toast } from "react-toastify"

import { CustomInput } from "@/components/ui"
import { Button } from "@nextui-org/react"
import { useQueryClient } from "@tanstack/react-query"
import { useActiveWallet } from "thirdweb/react"

import { useModalStore } from "@/stores"
import { usePurchaseNft } from "@/hooks/blockchain/usePurchaseNft"
import { usePurchaseGuildedNft } from "@/hooks/blockchain/usePurchaseGuildedNft"

import CustomModal from "../CustomModal"

export default function BuyNFTModal() {
	const { hideCustomModal, customModalType, tempCustomModalData } =
		useModalStore()
	const [quantity, setQuantity] = useState("1")
	const { purchaseNFT, isPending, error, data } = usePurchaseNft()
	const { purchaseGuildedNFT, isPending: isGuildedPending, error: guildedError, data: guildedData } = usePurchaseGuildedNft()
	const activeWallet = useActiveWallet()
	const queryClient = useQueryClient()
	
	const isGuildedNFT = tempCustomModalData?.isGuildedNFT
	const currentPending = isGuildedNFT ? isGuildedPending : isPending
	const currentError = isGuildedNFT ? guildedError : error
	const currentData = isGuildedNFT ? guildedData : data

	useEffect(() => {
		if (currentError) {
			if (currentError.message?.includes("Execution Reverted"))
				toast.error("Insufficient balance in your wallet")
			else toast.error(currentError.message)
		}
		if (currentData) {
			hideCustomModal()
			toast.success("Token purchased successfully")
			queryClient.invalidateQueries({ queryKey: ["nftDetails"] })
			queryClient.invalidateQueries({ queryKey: ["exchangeNftDetails"] })
			queryClient.invalidateQueries({ queryKey: ["nftData"] })
			queryClient.invalidateQueries({ queryKey: ["guildedNftDetails"] })
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentError, currentData])

	return (
		<CustomModal
			showModal={customModalType === "BUY_NFT_MODAL"}
			onClose={hideCustomModal}
			size="2xl"
			modalBodyClass="max-w-[480px] p-6"
		>
			<div className="flex flex-col gap-6 py-2 px-4">
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-semibold">Purchase Token</h2>
				</div>

				{/* Connect Wallet Section */}
				{!activeWallet && (
					<div className="space-y-6">
						<h3 className="text-base font-bold text-[#33383F] leading-[100%] tracking-[-0.015em]">
							Connect to the receiving wallet
						</h3>
						<div className="space-y-2">
							<Button className="w-full bg-btnColor text-white text-[13px] font-bold leading-6 tracking-[-0.015em] py-2 rounded-lg hover:bg-btnColorHover">
								Connect Wallet
							</Button>

							<div className="space-y-1">
								<p className="font-bold text-base text-[#33383F] leading-[150%] tracking-[-0.015em]">
									Don&apos;t have a wallet?
								</p>
								<p className="text-[12px] font-medium text-textGray leading-[20px] tracking-[-0.02em]">
									You can create a wallet with one click using your Google,
									Apple, or Facebook account. Just click &apos;Connect
									Wallet&apos; above and follow the prompt on the right side of
									the modal.
								</p>
							</div>
						</div>
					</div>
				)}

				{/* Quantity Section */}
				<div className="space-y-3">
					<h3 className="text-base font-bold text-textGray leading-[16px] tracking-[-0.01em]">
						Choose a Quantity
					</h3>
					<CustomInput
						type="number"
						value={quantity}
						onChange={(e) => setQuantity(e.target.value)}
						classname="focus:ring-2 focus:ring-[#1DB954] focus:border-transparent"
						errorMessage="Token quantity should be greater than 0 and cant exceed the available quantity"
						isInvalid={
							Number(quantity) > Number(tempCustomModalData?.quantity) ||
							Number(quantity) <= 0
						}
					/>
					<p className="text-[12px] font-bold text-textGray leading-[20px] tracking-[-0.02em]">
						Available quantity: {tempCustomModalData?.quantity}
					</p>
				</div>

				{/* Purchase Button */}
				<Button
					className="max-w-fit flex justify-self-center mx-auto text-[13px] font-bold leading-6 tracking-[-0.01em] bg-btnColor text-white py-2 px-4 rounded-lg hover:bg-btnColorHover"
					onPress={() => {
						if (isGuildedNFT) {
							purchaseGuildedNFT({
								listingId: tempCustomModalData?.listingId,
								tokenId: tempCustomModalData?.tokenId,
								networkChainId: tempCustomModalData?.chainId || "84532"
							})
						} else {
							purchaseNFT({
								listingId: tempCustomModalData?.listingId,
								amount: quantity,
								price: Number(tempCustomModalData?.price) * Number(quantity)
							})
						}
					}}
					isLoading={currentPending}
					isDisabled={
						Number(quantity) > Number(tempCustomModalData?.quantity) ||
						Number(quantity) <= 0 ||
						currentPending
					}
				>
					Purchase Token
				</Button>
			</div>
		</CustomModal>
	)
}
