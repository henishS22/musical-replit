"use client"

import { defineChain, getContract, prepareContractCall, toWei } from "thirdweb"
import { useSendTransaction } from "thirdweb/react"

import { client } from "@/config"

const contract = getContract({
	client,
	chain: defineChain(
		Number(process.env.NEXT_PUBLIC_TOKEN_CONTRACT_CHAIN) || 80002
	),
	address: process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS || ""
})

export const useMintAndList = () => {
	const {
		mutate: sendTransaction,
		isPending,
		error,
		data
	} = useSendTransaction({
		payModal: {
			buyWithFiat: {
				prefillSource: {
					currency: "USD"
				},
				testMode: true
			}
		}
	})

	const mintAndList = ({
		tokenOwner,
		amount,
		tokenURI,
		price,
		airdropAmount,
		recipients,
		percentages
	}: {
		tokenOwner: string
		amount: string
		tokenURI: string
		price: string
		airdropAmount: number
		recipients: string[]
		percentages: number[]
	}) => {
		if (!contract) {
			console.error("Contract not initialized")
			return
		}

		const transaction = prepareContractCall({
			contract,
			method:
				"function mintAndList(address _tokenOwner, uint256 _amount, string _tokenURI, uint256 _price, uint256 _airdropAmount, address[] _recipients, uint256[] _percentages)",
			params: [
				tokenOwner,
				BigInt(amount),
				tokenURI,
				toWei(price),
				BigInt(airdropAmount),
				recipients,
				percentages.map((p) => BigInt(p))
			]
		})

		sendTransaction(transaction)
	}

	return { mintAndList, isPending, error, data }
}
