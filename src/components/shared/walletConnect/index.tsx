"use client"

import { useEffect } from "react"
import { toast } from "react-toastify"

import { addWallet } from "@/app/api/mutation"
import { useMutation } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { createThirdwebClient } from "thirdweb"
import { ConnectButton, useActiveWallet } from "thirdweb/react"
import { createWallet } from "thirdweb/wallets"

import { useUserStore } from "@/stores"

function WalletAuth() {
	const { user, userData } = useUserStore()

	const activeWallet = useActiveWallet()

	const client = createThirdwebClient({
		clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || ""
	})

	const wallets = [
		createWallet("io.metamask"),
		createWallet("com.coinbase.wallet")
	]

	const { mutate } = useMutation({
		mutationFn: (payload: Record<string, string>) => addWallet(payload),
		onSuccess: (data) => {
			if (data) {
				toast.success("Wallet added successfully")
			}
		},
		onError: (error: Error) => {
			toast.error(error.message)
			activeWallet?.disconnect()
		}
		// enabled: !!user
	})

	const handleWalletConnect = () => {
		const payload = {
			owner: user?.id || "",
			addr: activeWallet?.getAccount()?.address || "",
			provider: activeWallet?.id === "io.metamask" ? "Metamask" : "Coinbase"
		}

		if (user) {
			mutate(payload)
		}
	}

	useEffect(() => {
		if (activeWallet && activeWallet?.getAccount()?.address) {
			const activeWalletAddress = activeWallet
				?.getAccount()
				?.address.toLocaleLowerCase()

			// Check if wallets array is empty or undefined
			if (!userData?.wallets || userData.wallets.length === 0) {
				handleWalletConnect()
				return
			}

			// Compare with the first registered wallet
			const registeredWalletAddress = userData.wallets[0].addr
			if (activeWalletAddress !== registeredWalletAddress) {
				toast.error(
					`Please connect with your registered wallet: ${registeredWalletAddress}`
				)
				activeWallet?.disconnect()
				return
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeWallet, userData?.wallets])

	return (
		<ConnectButton
			client={client}
			wallets={wallets}
			connectButton={{
				label: (
					<div className="flex items-center justify-center gap-2 text-white w-full h-full">
						<span>
							<Plus color="#fff" />
						</span>
						<span>Connect Wallet</span>
					</div>
				),
				className: "!bg-black !h-10 !flex !items-center !justify-center !text-white"
			}}
			connectModal={{
				size: "compact",
				showThirdwebBranding: false
			}}
			detailsButton={{
				className: "!bg-black !text-white !font-bold !border-none !h-10 !flex !items-center !justify-center"
			}}
			// onConnect={handleWalletConnect}
			showAllWallets={false}
		/>
	)
}

export default WalletAuth
