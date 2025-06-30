"use client"

import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { useParams, useRouter } from "next/navigation"

import { createNFT } from "@/app/api/mutation"
import { fetchExchangeNft, fetchNftsById } from "@/app/api/query"
import { PROFILE_IMAGE } from "@/assets"
import { EXCHANGE_CONFIRM_MODAL, SELECT_NFT_MODAL } from "@/constant/modalType"
import { generateQueryParams } from "@/helpers"
import { Button } from "@nextui-org/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useActiveWallet } from "thirdweb/react"

import { useUserStore } from "@/stores"
import { useModalStore } from "@/stores/modal"
import { useApproveNFTExchange } from "@/hooks/blockchain/useApproveNFTExchange"
import { useCancelNFTExchange } from "@/hooks/blockchain/useCancelNFTExchange"
import { useCheckApproval } from "@/hooks/blockchain/useCheckApproval"
import { useCheckBalance } from "@/hooks/blockchain/useCheckBalance"
import { useListNFT } from "@/hooks/blockchain/useListNFT"
import { useRegisterExchange } from "@/hooks/blockchain/useRegisterExchange"
import { useSetApprovalForAll } from "@/hooks/blockchain/useSetApprovalForAll"

import BuyNftCard from "../buyNFT/BuyNftCard"
import ExchangeConfirmModal from "../modal/exchangeConfirmModal/ExchangeConfirmModal"
import SelectNftModal from "../modal/selectNftModal/SelectNftModal"

const ExchangeNFT = () => {
	const { showCustomModal, hideCustomModal } = useModalStore()
	const [exchangeQuantity, setExchangeQuantity] = useState<number>(0)
	const [tokenId, setTokenId] = useState<number | null>(null)
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [isListing, setIsListing] = useState<boolean>(false)
	const [price, setPrice] = useState<number>(0)

	const {
		cancelNFTExchange,
		isPending: isCancelNFTExchangePending,
		data: cancelNFTExchangeData
	} = useCancelNFTExchange()
	const {
		approveNFTExchange,
		isPending: isApproveNFTExchangePending,
		data: approveNFTExchangeData
	} = useApproveNFTExchange()
	const { registerExchange, isPending, error, data } = useRegisterExchange()
	const activeWallet = useActiveWallet()
	const { userData, user } = useUserStore()
	const { id } = useParams()
	const queryClient = useQueryClient()
	const router = useRouter()
	const {
		listNFT,
		isPending: isListNFTPending,
		data: listNFTData,
		error: listNFTError
	} = useListNFT()

	const { data: isApproved, isPending: isApprovalCheckPending } =
		useCheckApproval()

	const {
		setApprovalForAll,
		isPending: isApprovalForAllPending,
		isSuccess: isApprovalForAllSuccess,
		error: isApprovalForAllError
	} = useSetApprovalForAll()

	const queryParams = generateQueryParams({
		owner: user?.id as string
	})

	const { data: nftDetails, isFetching: isNftDetailsFetching } = useQuery({
		queryKey: ["nftData", id],
		queryFn: () => fetchNftsById(id as string, queryParams),
		enabled: !!id,
		staleTime: 1000 * 60 * 60 * 24
	})

	const { data: exchangeNftDetails, isFetching: isExchangeNftDetailsFetching } =
		useQuery({
			queryKey: ["exchangeNftDetails", id],
			queryFn: () => fetchExchangeNft(id as string),
			enabled: !!id,
			staleTime: 1000 * 60 * 60 * 24
		})

	const { data: balance } = useCheckBalance(
		activeWallet?.getAccount()?.address as string,
		nftDetails?.[0]?.tokenId
	)

	const checkUserApprovalStatus = () => {
		if (!userData?._id || !exchangeNftDetails) return false

		const isUser1 = userData._id === exchangeNftDetails.user1.id
		const isUser2 = userData._id === exchangeNftDetails.user2.id

		if (isUser1) return exchangeNftDetails.user1.isApproved
		if (isUser2) return exchangeNftDetails.user2.isApproved

		return false
	}

	const NftViewSection = () => {
		return (
			<div className="flex gap-3">
				<Button
					onPress={() => {
						setIsListing(true)
						if (activeWallet) {
							showCustomModal({ customModalType: SELECT_NFT_MODAL })
						} else {
							toast.error("Please connect your wallet")
						}
					}}
					isDisabled={Number(balance) === 0}
					className="w-full bg-btnColor text-white text-[15px] leading-[24px] font-bold py-3 max-w-[200px] rounded-xl"
				>
					List
				</Button>

				<Button
					onPress={() => {
						setIsListing(false)
						if (activeWallet) {
							showCustomModal({ customModalType: SELECT_NFT_MODAL })
						} else {
							toast.error("Please connect your wallet")
						}
					}}
					className="text-[15px] leading-[24px] font-bold py-3 max-w-[200px] w-full rounded-xl bg-white text-[#1DB954] border-[#1DB954] border-2"
					isDisabled={Number(balance) === 0}
				>
					Exchange
				</Button>
			</div>
		)
	}

	const ExchangeNftViewSection = () => {
		return (
			<Button
				onPress={() => {
					if (activeWallet) {
						showCustomModal({
							customModalType: SELECT_NFT_MODAL
						})
					} else {
						toast.error("Please connect your wallet")
					}
				}}
				className="text-[15px] leading-[24px] font-bold py-3 max-w-[200px] w-full rounded-xl bg-white text-[#1DB954] border-[#1DB954] border-2"
				isDisabled={
					exchangeNftDetails?.user1_details[0]?._id === userData?._id ||
					exchangeNftDetails?.user2_details[0]?._id === userData?._id
				}
			>
				Exchange
			</Button>
		)
	}

	const ApproveSection = () => {
		return (
			<div className="flex gap-3">
				<Button
					onPress={() => approveNFTExchange(exchangeNftDetails?.exchangeId)}
					isLoading={isApproveNFTExchangePending}
					isDisabled={isApproveNFTExchangePending || checkUserApprovalStatus()}
					className="w-full bg-btnColor text-white text-[15px] leading-[24px] font-bold py-3 max-w-[200px] rounded-xl"
				>
					Approve
				</Button>

				<Button
					onPress={() => cancelNFTExchange(exchangeNftDetails?.exchangeId)}
					isLoading={isCancelNFTExchangePending}
					isDisabled={isCancelNFTExchangePending || checkUserApprovalStatus()}
					className="text-[15px] leading-[24px] font-bold py-3 max-w-[200px] w-full rounded-xl bg-white text-[#1DB954] border-[#1DB954] border-2"
				>
					Cancel
				</Button>
			</div>
		)
	}

	const nftData = {
		content: <NftViewSection />,
		showVerifyButton: false,
		imageUrl: nftDetails?.[0]?.artworkUrl,
		creatorImage: nftDetails?.[0]?.user?.profile_img || PROFILE_IMAGE,
		creatorName: `By ${nftDetails?.[0]?.user?.name}`,
		title: nftDetails?.[0]?.title,
		description: nftDetails?.[0]?.description,
		price: nftDetails?.[0]?.price,
		isLoading: isNftDetailsFetching,
		tokenId: nftDetails?.[0]?.tokenId,
		ownerId: nftDetails?.[0]?.user?._id,
		txnHash: nftDetails?.[0]?.txnHash
	}

	const exchangeNftData = {
		content:
			exchangeNftDetails?.status === "pending" ? (
				exchangeNftDetails?.user2_nft_details?.length ? (
					<ApproveSection />
				) : (
					<ExchangeNftViewSection />
				)
			) : (
				<Button
					isDisabled={true}
					className="text-[15px] leading-[24px] font-bold py-3 max-w-[200px] w-full rounded-xl bg-white text-[#df4641] border-[#df4641] border-2"
				>
					Exchange Cancelled
				</Button>
			),
		showVerifyButton: false,
		imageUrl:
			userData?._id !== exchangeNftDetails?.user1_details[0]._id
				? exchangeNftDetails?.user1_nft_details[0].artworkUrl
				: exchangeNftDetails?.user2_nft_details[0].artworkUrl ||
					exchangeNftDetails?.user1_nft_details[0].artworkUrl,
		creatorImage:
			userData?._id !== exchangeNftDetails?.user1_details[0]._id
				? exchangeNftDetails?.user1_details[0]?.profile_img
				: exchangeNftDetails?.user2_details[0]?.profile_img ||
					exchangeNftDetails?.user1_details[0]?.profile_img,
		creatorName:
			userData?._id !== exchangeNftDetails?.user1_details[0]._id
				? exchangeNftDetails?.user1_details[0]?.name
				: exchangeNftDetails?.user2_details[0]?.name ||
					exchangeNftDetails?.user1_details[0]?.name,
		title:
			userData?._id !== exchangeNftDetails?.user1_details[0]._id
				? exchangeNftDetails?.user1_nft_details[0].title
				: exchangeNftDetails?.user2_nft_details[0].title ||
					exchangeNftDetails?.user1_nft_details[0].title,
		description:
			userData?._id !== exchangeNftDetails?.user1_details[0]._id
				? exchangeNftDetails?.user1_nft_details[0].description
				: exchangeNftDetails?.user2_nft_details[0].description ||
					exchangeNftDetails?.user1_nft_details[0].description,
		isLoading: isExchangeNftDetailsFetching,
		tokenId:
			userData?._id !== exchangeNftDetails?.user1_details[0]._id
				? exchangeNftDetails?.user1_nft_details[0].tokenId
				: exchangeNftDetails?.user2_nft_details[0].tokenId ||
					exchangeNftDetails?.user1_nft_details[0].tokenId,
		ownerId:
			userData?._id !== exchangeNftDetails?.user1_details[0]._id
				? exchangeNftDetails?.user1_nft_details[0].user?._id
				: exchangeNftDetails?.user2_nft_details[0].user?._id ||
					exchangeNftDetails?.user1_nft_details[0].user?._id,
		...(exchangeNftDetails?.user2_nft_details?.length &&
			exchangeNftDetails?.user1_nft_details?.length && {
				ownedNftImageUrl:
					userData?._id === exchangeNftDetails?.user1_details[0]._id
						? exchangeNftDetails?.user1_nft_details[0].artworkUrl
						: exchangeNftDetails?.user2_nft_details[0].artworkUrl,
				ownedNftTitle:
					userData?._id === exchangeNftDetails?.user1_details[0]._id
						? exchangeNftDetails?.user1_nft_details[0].title
						: exchangeNftDetails?.user2_nft_details[0].title,
				ownedCreatorImage:
					userData?._id === exchangeNftDetails?.user1_details[0]._id
						? exchangeNftDetails?.user1_details[0]?.profile_img
						: exchangeNftDetails?.user2_details[0]?.profile_img,
				ownedCreatorName:
					userData?._id === exchangeNftDetails?.user1_details[0]._id
						? exchangeNftDetails?.user1_details[0]?.name
						: exchangeNftDetails?.user2_details[0]?.name
			})
	}

	const handleExchange = () => {
		registerExchange({
			tokenId: exchangeNftDetails?.exchangeId
				? tokenId
				: nftDetails?.[0]?.tokenId,
			amount: exchangeQuantity,
			exchangeId: exchangeNftDetails?.exchangeId || 0
		})
	}

	const onExchange = () => {
		if (isListing) {
			if (isApproved) {
				listNFT({
					seller: activeWallet?.getAccount()?.address as string,
					tokenId: nftDetails?.[0]?.tokenId,
					price: price.toString(),
					amount: exchangeQuantity.toString()
				})
			} else {
				setApprovalForAll()
			}
		} else {
			showCustomModal({
				customModalType: EXCHANGE_CONFIRM_MODAL,
				tempCustomModalData: {
					onConfirm: handleExchange
				}
			})
		}
	}

	const { mutate, isPending: isCreatingNFT } = useMutation({
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		mutationFn: (payload: any) =>
			createNFT(payload, nftDetails?.[0]?.project?._id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["nftListing"] })
			router.push(`/marketplace`)
		},
		onError: (error) => {
			toast.error(error.message)
		}
	})

	useEffect(() => {
		setIsLoading(isPending)
		if (data) {
			toast.success("NFTs registered for exchange successfully")
			hideCustomModal()
		}
		if (error) {
			toast.error("Error registering NFTs for exchange")
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data, error, isPending])

	useEffect(() => {
		if (listNFTData) {
			hideCustomModal()
			toast.success("NFTs listed successfully")
			queryClient.invalidateQueries({ queryKey: ["nftDetails"] })
			queryClient.invalidateQueries({ queryKey: ["exchangeNftDetails"] })
			queryClient.invalidateQueries({ queryKey: ["nftData"] })
			const payload = {
				user: userData?._id ?? "",
				project: nftDetails?.[0]?.project?._id,
				description: nftDetails?.[0]?.description,
				title: nftDetails?.[0]?.title,
				price: price.toString(),
				initialSupply: exchangeQuantity.toString(),
				chainId: process.env.NEXT_PUBLIC_TOKEN_CONTRACT_CHAIN ?? "",
				wallet: activeWallet?.getAccount()?.address as string,
				artworkExtension: nftDetails?.[0]?.artworkExtension ?? "",
				selectedTracks: nftDetails?.[0]?.selectedTracks ?? [],
				finalVersions: nftDetails?.[0]?.finalVersions ?? [],
				contracts: nftDetails?.[0]?.contracts ?? [],
				transactionHash: listNFTData.transactionHash ?? "",
				tokenURI: nftDetails?.[0]?.tokenURI ?? "",
				artworkUrl: nftDetails?.[0]?.artworkUrl ?? ""
			}
			mutate(payload)
		}
		if (listNFTError) {
			toast.error(listNFTError.message)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [listNFTData, listNFTError])

	useEffect(() => {
		if (isApprovalForAllError) {
			toast.error(isApprovalForAllError.message)
		}
		if (isApprovalForAllSuccess) {
			listNFT({
				seller: activeWallet?.getAccount()?.address as string,
				tokenId: nftDetails?.[0]?.tokenId,
				price: price.toString(),
				amount: exchangeQuantity.toString()
			})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isApprovalForAllSuccess, isApprovalForAllPending])

	useEffect(() => {
		if (approveNFTExchangeData) {
			toast.success("NFT approved for exchange successfully")
			queryClient.invalidateQueries({ queryKey: ["nftDetails"] })
			queryClient.invalidateQueries({ queryKey: ["exchangeNftDetails"] })
			queryClient.invalidateQueries({ queryKey: ["nftData"] })
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [approveNFTExchangeData])

	useEffect(() => {
		if (cancelNFTExchangeData) {
			toast.success("NFT cancelled for exchange successfully")
			queryClient.invalidateQueries({ queryKey: ["nftDetails"] })
			queryClient.invalidateQueries({ queryKey: ["exchangeNftDetails"] })
			queryClient.invalidateQueries({ queryKey: ["nftData"] })
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [cancelNFTExchangeData])

	return (
		<div className="relative">
			<div>
				{exchangeNftDetails?.exchangeId ? (
					<BuyNftCard {...exchangeNftData} />
				) : (
					<BuyNftCard {...nftData} />
				)}
			</div>
			<SelectNftModal
				onSubmit={onExchange}
				modalConfig={
					isListing
						? {
								heading: "List NFTs",
								buttonText: isApproved ? "List" : "Approve wallet",
								showNftSelect: false,
								secondInput: {
									label: "Price (ETH)",
									type: "number",
									placeholder: "Enter price"
								}
							}
						: {
								heading: "Exchange NFTs",
								buttonText: "Exchange",
								showNftSelect: !!exchangeNftDetails?.exchangeId
							}
				}
				quantityPurchased={nftDetails?.[0]?.quantity}
				setExchangeQuantity={setExchangeQuantity}
				setTokenId={setTokenId}
				setPrice={setPrice}
				isListNFTPending={
					isListNFTPending ||
					isApprovalForAllPending ||
					isApprovalCheckPending ||
					isCreatingNFT
				}
			/>
			<ExchangeConfirmModal isPending={isLoading} />
		</div>
	)
}

export default ExchangeNFT
