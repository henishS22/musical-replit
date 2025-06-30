"use client"

import { defineChain, getContract } from "thirdweb"
import { useReadContract } from "thirdweb/react"

import { client } from "@/config"

const contract = getContract({
	client,
	chain: defineChain(
		Number(process.env.NEXT_PUBLIC_TOKEN_CONTRACT_CHAIN) || 80002
	),
	address: process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS || ""
})

export const useCheckBalance = (account: string, id: bigint) => {
	const { data, isPending, error } = useReadContract({
		contract,
		method:
			"function balanceOf(address account, uint256 id) view returns (uint256)",
		params: [account, id]
	})

	return { data, isPending, error }
}
