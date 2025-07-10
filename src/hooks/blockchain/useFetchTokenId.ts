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

export const useFetchTokenId = () => {
	const { data, isPending, error } = useReadContract({
		contract,
		method: "function nextTokenId() view returns (uint256)",
		params: []
	})

	return { data, isPending, error }
}
