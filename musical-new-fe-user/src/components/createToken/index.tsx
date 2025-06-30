"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import Image from "next/image"
import { useRouter } from "next/navigation"

import { createNFT } from "@/app/api/mutation"
import { MEDIA_PREVIEW } from "@/assets"
import { AUDIO_VIDEO_MODAL } from "@/constant/modalType"
import { getBase64ImageExtension } from "@/helpers/common"
import { createTokenMetadata, uploadArtworkToIPFS } from "@/helpers/ipfsHelpers"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useActiveWallet } from "thirdweb/react"

import { useDynamicStore, useModalStore, useUserStore } from "@/stores"
import { useMintAndList } from "@/hooks/blockchain"
import { useFormNavigationAlert } from "@/hooks/useFormNavigationAlert"

import ImageUpload from "../createProject/ImageUpload"
import { CustomInput, TitleBadgeCard } from "../ui"
import { CustomTextarea } from "../ui/customTextarea"
import { ContractTable } from "./contract/ContractTable"
import Footer from "./footer/Footer"
import PreviewTrackList from "./PreviewTrackList"
import PriceBox from "./price/PriceBox"

export interface TokenFormData {
	artwork: string
	title: string
	description: string
	initialQuantity: string
	price: string
	total: string
	tokenURI: string
	trackId: string
	ipfsHash: string
	royalty: {
		userName: string
		userImage: string
		splitValue: string
		walletAddress: string
		id: string
	}[]
}

const CreateToken = () => {
	const activeWallet = useActiveWallet()

	const { showCustomModal } = useModalStore()
	const { mintAndList, isPending, error, data } = useMintAndList()
	const { tokenTracks, tokenProject, tokenDescription, updateState } =
		useDynamicStore()
	const { userData } = useUserStore()
	const router = useRouter()
	const queryClient = useQueryClient()

	const [isUploading, setIsUploading] = useState(false)
	const [tokenURI, setTokenURI] = useState("")
	const [artworkIpfsURL, setArtworkIpfsURL] = useState("")
	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors, isDirty },
		getValues
	} = useForm<TokenFormData>({
		defaultValues: {
			artwork: "",
			title: "",
			description: tokenDescription,
			initialQuantity: "",
			price: "",
			total: "",
			tokenURI: "",
			trackId: "",
			ipfsHash: "",
			royalty: [
				{
					userName: "",
					userImage: "",
					splitValue: "",
					walletAddress: "",
					id: ""
				}
			]
		}
	})

	// Form Navigation Alert
	useFormNavigationAlert({ formState: { isDirty } })

	const showPreviewModal = () => {
		showCustomModal({ customModalType: AUDIO_VIDEO_MODAL })
	}

	const PreviewComponent = () => {
		return (
			<div
				className="flex gap-2.5 items-start self-stretch w-10 cursor-pointer"
				onClick={showPreviewModal}
			>
				<Image
					loading="lazy"
					src={MEDIA_PREVIEW}
					alt="Preview controls"
					width={24}
					height={24}
					className="object-contain"
				/>
			</div>
		)
	}

	const { mutate, isPending: isCreatingNFT } = useMutation({
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		mutationFn: (payload: any) => createNFT(payload, tokenProject._id),
		onSuccess: () => {
			updateState("formNavigation", { isDirty: false })
			toast.success("Token created successfully")
			queryClient.invalidateQueries({ queryKey: ["nftListing"] })
			router.push(`/marketplace`)
		},
		onError: (error) => {
			toast.error(error.message)
		}
	})

	const handleCreateToken = (txHash: string) => {
		const { description, title, initialQuantity, royalty, artwork, total } =
			getValues()
		const artworkExtension = getBase64ImageExtension(artwork)

		const contracts = royalty.map((item) => ({
			user: item.id ?? "",
			split: Number(item.splitValue),
			accepted: true,
			address: item.walletAddress
		}))

		const selectedTracks = tokenTracks.map(
			(track: { _id: string }) => track._id
		)
		const finalVersions = tokenTracks.map((track: { _id: string }) => track._id)
		const pricePerToken = Number(total) / Number(initialQuantity)

		const payload = {
			user: userData?._id ?? "",
			project: tokenProject._id,
			description,
			title,
			price: pricePerToken.toString(),
			initialSupply: initialQuantity,
			chainId: process.env.NEXT_PUBLIC_TOKEN_CONTRACT_CHAIN ?? "",
			wallet: royalty[0].walletAddress,
			artworkExtension: artworkExtension ?? "",
			selectedTracks,
			finalVersions,
			contracts,
			transactionHash: txHash,
			tokenUri: tokenURI,
			artworkUrl: artworkIpfsURL
		}

		mutate(payload)
	}

	const onSubmit = async (data: TokenFormData) => {
		try {
			setIsUploading(true)

			if (!activeWallet) {
				toast.error("Please connect your wallet")
				return
			}

			// Validate required fields
			if (!data.artwork) {
				toast.error("Artwork is required")
				return
			}
			if (!data.price || Number(data.price) <= 0) {
				toast.error("Price is required")
				return
			}
			if (!data.initialQuantity || Number(data.initialQuantity) <= 0) {
				toast.error("Quantity is required")
				return
			}

			// Check all royalty wallet addresses
			const emptyWalletAddresses = data.royalty.filter(
				(item) => item.walletAddress.length === 0
			)

			if (emptyWalletAddresses.length > 0) {
				toast.error("Wallet address is required for all royalty recipients")
				return
			}

			// Upload artwork and create metadata on IPFS
			const metadataHash = await createTokenMetadata({
				artwork: data.artwork,
				trackId: tokenTracks.map((track: { _id: string }) => track._id),
				title: data.title,
				description: data.description
			})

			const artworkHash = await uploadArtworkToIPFS(data.artwork)
			setArtworkIpfsURL(
				`${process.env.NEXT_PUBLIC_PINATA_BASE_URL}/${artworkHash}`
			)

			setTokenURI(`${process.env.NEXT_PUBLIC_PINATA_BASE_URL}/${metadataHash}`)
			// Call smart contract
			const pricePerToken = Number(data.total) / Number(data.initialQuantity)
			mintAndList({
				tokenOwner: data.royalty[0].walletAddress,
				amount: data.initialQuantity,
				tokenURI: `${process.env.NEXT_PUBLIC_PINATA_BASE_URL}/${metadataHash}`,
				price: pricePerToken.toFixed(22),
				airdropAmount: 0,
				recipients: data.royalty.map((item) => item.walletAddress),
				percentages: data.royalty.map((item) => Number(item.splitValue) * 100)
			})
		} catch {
			toast.error("Failed to create token")
		} finally {
			setIsUploading(false)
		}
	}

	const handleImageUpload = (file: File) => {
		const reader = new FileReader()
		reader.onloadend = () => {
			setValue("artwork", reader.result as string, { shouldDirty: true })
		}
		reader.readAsDataURL(file)
	}

	useEffect(() => {
		if (error) {
			toast.error(error.message)
		}

		if (data?.transactionHash) {
			handleCreateToken(data.transactionHash)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data, error])

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
			<div className="flex flex-col gap-6 p-6">
				<h1 className="text-4xl font-semibold tracking-tighter leading-tight text-zinc-800 mb-2">
					Create Token
				</h1>

				<div className="flex gap-2">
					<div className="flex flex-col gap-6">
						<TitleBadgeCard
							markColor="#8A8A8A"
							title="Artwork"
							titleClassName="!mb-0"
						>
							<div className="flex flex-col mt-8 w-full">
								<ImageUpload
									onImageUpload={handleImageUpload}
									onRemove={() => setValue("artwork", "")}
									error={errors.artwork?.message}
								/>
							</div>
						</TitleBadgeCard>

						<TitleBadgeCard
							markColor="#8A8A8A"
							title="Name & description"
							titleClassName="!mb-0"
						>
							<div className="flex flex-col mt-8 w-full">
								<CustomInput
									label="Title"
									type="text"
									{...register("title", {
										required: "Title is required"
									})}
									showTooltip
									tooltipText="Maximum 100 characters. No HTML or emoji allowed"
									placeholder="Enter Title"
									errorMessage={errors.title?.message}
									isInvalid={!!errors.title}
								/>
							</div>
							<div className="flex flex-col mt-8 w-full">
								<CustomTextarea
									label="Description"
									{...register("description", {
										required: "Description is required"
									})}
									rows={4}
									placeholder="Enter Description"
									showTooltip
									tooltipText="Maximum 100 characters. No HTML or emoji allowed"
									errorMessage={errors.description?.message}
									isInvalid={!!errors.description}
								/>
							</div>
						</TitleBadgeCard>
						<TitleBadgeCard
							markColor="#8A8A8A"
							title="Price"
							titleClassName="!mb-0"
						>
							<PriceBox setValue={setValue} />
						</TitleBadgeCard>
						<TitleBadgeCard
							markColor="#8A8A8A"
							title="Token Contract"
							titleClassName="!mb-0"
						>
							<ContractTable setValue={setValue} />
						</TitleBadgeCard>
					</div>
					<div className="flex overflow-hidden flex-col rounded-lg bg-zinc-50 min-w-[240px] w-[340px] max-md:px-5">
						<TitleBadgeCard
							markColor="#8A8A8A"
							title="Preview"
							subComponent={<PreviewComponent />}
						>
							<PreviewTrackList />
						</TitleBadgeCard>
					</div>
				</div>
			</div>

			<Footer isLoading={isUploading || isPending || isCreatingNFT} />
		</form>
	)
}

export default CreateToken
