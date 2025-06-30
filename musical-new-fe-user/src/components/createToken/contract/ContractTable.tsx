import React, { useEffect, useState } from "react"

import { ProjectCollaborator, SetValue } from "@/types/createProjectTypes"
import { Info } from "lucide-react"

import { useDynamicStore, useUserStore } from "@/stores"

import { ContractTableHeader } from "./ContractTableHeader"
import { ContractTableRow } from "./ContractTableRow"

interface TableDataItem {
	userName: string
	userImage: string
	splitValue: string
	walletAddress: string
	id: string
}

export const ContractTable = ({ setValue }: { setValue: SetValue }) => {
	const { tokenProject } = useDynamicStore()
	const { userData } = useUserStore()
	const [tableData, setTableData] = useState<TableDataItem[]>([])
	const [walletAddress, setWalletAddress] = useState<{ addr: string }[]>([])

	useEffect(() => {
		const newData = [
			{
				userName: userData?.name || "",
				userImage: userData?.profile_img || "",
				splitValue: String(tokenProject?.split || ""),
				id: userData?._id || "",
				walletAddress:
					userData?.wallets && userData.wallets.length > 0
						? userData.wallets[0].addr
						: []
			},
			...(tokenProject?.collaborators.map(
				(collaborator: ProjectCollaborator) => ({
					userName: collaborator.user?.name || "",
					userImage: collaborator.user?.profile_img || "",
					splitValue: String(collaborator.split || ""),
					id: collaborator.user?._id || "",
					walletAddress:
						collaborator.user?.wallets && collaborator.user?.wallets.length > 0
							? collaborator.user?.wallets[0].addr
							: []
				})
			) || [])
		]
		setTableData(newData)
		const walletAddresses =
			tokenProject?.collaborators.length > 0
				? tokenProject?.collaborators.map(
						(item: ProjectCollaborator) => item.user?.wallets
					)
				: []
		const newWalletAddress = [userData?.wallets, ...walletAddresses]

		setWalletAddress(newWalletAddress)
	}, [userData, tokenProject])

	useEffect(() => {
		setValue("royalty", tableData)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tableData])

	return (
		<div className="w-full bg-[#FCFCFC] rounded-lg max-md:overflow-x-auto max-sm:overflow-x-auto mt-6">
			<ContractTableHeader />

			{tableData.map((item, index) => (
				<ContractTableRow
					key={item.userName}
					userName={item.userName}
					userImage={item.userImage}
					splitValue={item.splitValue}
					walletAddress={walletAddress?.length > 0 ? walletAddress[index] : []}
					id={item.id}
					setValue={setValue}
					royalty={tableData}
				/>
			))}
			<div className="flex mt-4 font-medium text-sm text-textGray gap-2 items-center">
				<Info className="w-4 h-4" /> Splits can only be changed at the Project
				level. Return to your Project to add or change collaborators.
			</div>
		</div>
	)
}
