"use client"

import { useState } from "react"

import { fetchNftsByUser } from "@/app/api/query"
import NFTCard from "@/components/profile/tokenTab/NftCard"
import { CustomInput, NoDataFound } from "@/components/ui"
import { SELECT_NFT_MODAL } from "@/constant/modalType"
import { IUser } from "@/types/apiResponse"
import { Button, Checkbox } from "@nextui-org/react"
import { useQuery } from "@tanstack/react-query"

import { useModalStore, useUserStore } from "@/stores"

import CustomModal from "../CustomModal"

interface SelectNftModalProps {
	onSubmit: () => void
	modalConfig: {
		heading: string
		buttonText: string
		showNftSelect?: boolean
		secondInput?: {
			label: string
			type: string
			placeholder?: string
		}
	}
	quantityPurchased: number
	setExchangeQuantity: (quantity: number) => void
	setTokenId: (tokenId: number) => void
	setPrice: (price: number) => void
	isListNFTPending: boolean
}

interface UserNft {
	_id: string
	user: IUser
	title: string
	artworkExtension: string
	tokenId: number
	artworkUrl: string
	quantity: number
	nftListedQuantity: number
	nftExchangeQuantity: number
}

export default function SelectNftModal({
	onSubmit,
	modalConfig,
	quantityPurchased,
	setExchangeQuantity,
	setTokenId,
	setPrice,
	isListNFTPending = false
}: SelectNftModalProps) {
	const [selectedNFTs, setSelectedNFTs] = useState<string>("")
	const [nftQuantity, setNftQuantity] = useState<number>(0)
	const [initialQuantity, setInitialQuantity] = useState<string>("")
	const [secondInputValue, setSecondInputValue] = useState<string>("")
	const { customModalType, hideCustomModal } = useModalStore()
	const { userData } = useUserStore()

	const handleSubmit = () => {
		onSubmit()
	}

	const { data: nftsByUser, isFetching } = useQuery({
		queryKey: ["nftsByUser"],
		queryFn: fetchNftsByUser,
		staleTime: 1000 * 60 * 60 * 24,
		enabled: !!userData?._id
	})

	return (
		<CustomModal
			showModal={customModalType === SELECT_NFT_MODAL}
			onClose={hideCustomModal}
			title={modalConfig.heading}
			modalBodyClass="max-w-[540px]"
		>
			<div className="p-6">
				<p className="font-semibold text-base text-inputLabel mb-6">
					{modalConfig.heading}
				</p>

				{modalConfig.showNftSelect && (
					<>
						<p className="mb-[30px] font-semibold text-base text-inputLabel">
							Select the NFT you want to exchange
						</p>

						<div className=" max-h-[calc(100%_-_455px)] overflow-y-auto pr-2 scrollbar h-[400px]">
							{isFetching ? (
								<>
									{[...Array(3)].map((_, index) => (
										<div key={index} className="mb-4 flex items-center gap-3">
											<div className="w-5 h-5 rounded bg-gray-200 animate-pulse" />
											<div className="flex-1">
												<div className="w-full h-[200px] rounded-xl bg-gray-200 animate-pulse" />
												<div className="mt-2 space-y-2">
													<div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse" />
													<div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse" />
												</div>
											</div>
											<div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
										</div>
									))}
								</>
							) : nftsByUser?.tokensPurchasedByWallet?.length > 0 ? (
								nftsByUser?.tokensPurchasedByWallet?.map((nft: UserNft) => (
									<div key={nft._id} className="mb-4 flex items-center gap-3">
										<Checkbox
											isSelected={selectedNFTs === nft._id}
											onValueChange={() => {
												setSelectedNFTs(nft._id)
												setNftQuantity(
													nft.quantity -
														nft.nftListedQuantity -
														nft.nftExchangeQuantity
												)
												setTokenId(nft.tokenId)
											}}
											color="success"
										/>
										<div className="flex-1">
											<NFTCard
												artworkUrl={nft.artworkUrl}
												title={nft.title}
												artist={nft.user.name}
												id={nft._id}
											/>
										</div>
										<div className="text-sm text-gray-500">
											Quantity:{nft?.quantity}
										</div>
									</div>
								))
							) : (
								<NoDataFound message="No NFTs found" />
							)}
						</div>
					</>
				)}

				<div className="mt-[30px] space-y-4">
					<CustomInput
						label="Initial Quantity"
						type="number"
						value={initialQuantity}
						onChange={(e) => {
							setInitialQuantity(e.target.value)
							setExchangeQuantity(Number(e.target.value))
						}}
						classname="!rounded-xl"
						isInvalid={
							selectedNFTs
								? Number(initialQuantity) > nftQuantity
								: Number(initialQuantity) > quantityPurchased
						}
						errorMessage={
							"Initial quantity cannot be greater than quantity purchased"
						}
					/>
					{quantityPurchased > 0 && (
						<p className="text-sm text-gray-500">
							Quantity Purchased: {quantityPurchased}
						</p>
					)}
					{modalConfig.secondInput && (
						<CustomInput
							label={modalConfig.secondInput.label}
							type={modalConfig.secondInput.type}
							placeholder={modalConfig.secondInput.placeholder}
							value={secondInputValue}
							onChange={(e) => {
								setPrice(Number(e.target.value))
								setSecondInputValue(e.target.value)
							}}
							classname="!rounded-xl"
						/>
					)}
				</div>

				<div className="w-full flex justify-end mt-6">
					<Button
						onPress={handleSubmit}
						className="w-full max-w-fit bg-btnColor text-white py-2 px-4 rounded-lg hover:bg-btnColorHover"
						isDisabled={
							Number(initialQuantity) > quantityPurchased ||
							Number(initialQuantity) === 0 ||
							isListNFTPending
						}
						isLoading={isListNFTPending}
					>
						{modalConfig.buttonText}
					</Button>
				</div>
			</div>
		</CustomModal>
	)
}
