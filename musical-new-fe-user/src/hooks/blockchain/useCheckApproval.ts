"use client"

import { defineChain, getContract } from "thirdweb"
import { useActiveWallet, useReadContract } from "thirdweb/react"

import { client } from "@/config"

const contract = getContract({
	client,
	chain: defineChain(
		Number(process.env.NEXT_PUBLIC_TOKEN_CONTRACT_CHAIN) || 80002
	),
	address: process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS || ""
})

export const useCheckApproval = () => {
	const activeWallet = useActiveWallet()
	const accountAddress = activeWallet?.getAccount()?.address

	const { data, isPending, error } = useReadContract({
		contract,
		method:
			"function isApprovedForAll(address account, address operator) view returns (bool)",
		params: [
			accountAddress as string,
			process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS as string
		]
	})

	return { data, isPending, error }
}
