import React from "react"
import Image from "next/image"

import { PROFILE_IMAGE } from "@/assets"
import { SetValue } from "@/types/createProjectTypes"

interface Wallet {
	addr: string
	provider: string
}

interface ContractTableRowProps {
	userName: string
	userImage: string
	splitValue: string
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	walletAddress: Wallet[] | any
	id: string
	setValue: SetValue
	royalty: {
		userName: string
		userImage: string
		splitValue: string
		walletAddress: string
		id: string
	}[]
}

export const ContractTableRow: React.FC<ContractTableRowProps> = ({
	userName,
	userImage,
	splitValue,
	walletAddress
	// id,
	// setValue,
	// royalty
}) => {
	const formatWalletAddress = (address: string) => {
		return `${address.slice(0, 6)}...${address.slice(-4)}`
	}

	const displayWallet = walletAddress?.[0]?.addr
		? formatWalletAddress(walletAddress[0].addr)
		: "Add wallet"

	return (
		<div className="grid grid-cols-[1fr_1fr_1fr] w-full p-3 gap-4 bg-[#F4F4F4]">
			<div className="flex items-center gap-2">
				<Image
					src={userImage || PROFILE_IMAGE}
					alt={`${userName}'s avatar`}
					className="w-8 h-8 object-cover rounded-lg"
					width={32}
					height={32}
				/>
				<div className="text-[#1A1D1F] text-xs font-semibold leading-3 tracking-[-0.12px]">
					{userName}
				</div>
			</div>

			<div className="w-full flex items-center">
				<span
					className={`text-xs ${displayWallet === "Add wallet" ? "text-red-500" : "text-[#1A1D1F]"}`}
				>
					{displayWallet}
				</span>
			</div>

			<div className="flex w-full max-w-[80px] justify-between items-center rounded border bg-[#F4F4F4] px-2 py-0 border-solid border-textGray">
				<input
					type="text"
					value={splitValue}
					readOnly
					className="w-8 bg-transparent text-[#1A1D1F] text-xs font-semibold leading-6 tracking-[-0.12px] outline-none cursor-default"
					aria-label="Split percentage"
				/>
				<div className="text-[#1A1D1F] text-xs font-semibold leading-6 tracking-[-0.12px]">
					%
				</div>
			</div>
		</div>
	)
}
