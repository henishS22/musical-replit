/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { fetchSearchReposts } from "@/app/api/query"
import { PROFILE_IMAGE, TRACK_THUMBNAIL } from "@/assets"
import { CONFIRMATION_MODAL, INVITE_FRIENDS_MODAL } from "@/constant/modalType"
import { getMediaType } from "@/helpers"
import { handleLogout } from "@/helpers/apiHelpers"
import { Collaborator } from "@/types/createProjectTypes"
import { ProjectDataType } from "@/types/dashboarApiTypes"
import {
	AutocompleteItem,
	Avatar,
	Button,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger
} from "@nextui-org/react"
import { useQuery } from "@tanstack/react-query"
import { SearchIcon } from "lucide-react"
import { useActiveWallet } from "thirdweb/react"

import {
	useAIChatStore,
	useDynamicStore,
	useLibraryStore,
	useModalStore,
	useUserStore
} from "@/stores"

import { CustomSearchbar } from "../ui"
import NotificationsDropdown from "../ui/dropdown/NotificationsDropdown"
import WalletAuth from "./walletConnect"

export const Header = () => {
	const [isPending, startTransition] = useTransition()
	const { showCustomModal, hideCustomModal, setCustomModalLoading } =
		useModalStore()
	const resetState = useDynamicStore((state) => state.resetState)
	const clearMessages = useAIChatStore((state) => state.clearMessages)
	const clearLibraryStore = useLibraryStore((state) => state.clearLibraryStore)
	const { logout, userData, user } = useUserStore()
	const router = useRouter()
	const { addState, updateState } = useDynamicStore()
	const activeWallet = useActiveWallet()

	const [search, setSearch] = useState<string>("")
	const [searchResult, setSearchResult] = useState<any[]>([])

	const { data } = useQuery({
		queryKey: ["searchResult", search],
		queryFn: () => fetchSearchReposts(`search=${search}`),
		// ⬇️ disabled as long as the filter is empty
		enabled: !!search
	})

	const handleModal = async () => {
		// Handle logout logic here
		showCustomModal({
			customModalType: CONFIRMATION_MODAL,
			modalFunction: handleConfirm,
			tempCustomModalData: {
				title: "Confirmation",
				msg: "Are you sure want to logout?",
				isLoading: isPending
			}
		})
	}

	const logoutAction = () => {
		setCustomModalLoading(false)
		hideCustomModal()
		logout()
		router.push("/login")
		activeWallet?.disconnect()
		resetState()
		clearMessages()
		clearLibraryStore()
	}

	const handleConfirm = () => {
		setCustomModalLoading(true)
		startTransition(async () => {
			await handleLogout(logoutAction)
		})
	}

	const renderType = (item: any) => {
		if (item.isProject === true) {
			return "Project"
		} else if (item.isArtist === true) {
			return "Artist"
		} else {
			return "Music"
		}
	}

	useEffect(() => {
		if (data) {
			// Restructure the data
			const structuredData = [
				...data.projects.map((item: any) => ({
					...item,
					isArtist: false,
					isProject: true,
					isMusic: false
				})),
				...data.tracks.map((item: any) => ({
					...item,
					isArtist: false,
					isProject: false,
					isMusic: true
				})),
				...data.artists.map((item: any) => ({
					...item,
					isArtist: true,
					isProject: false,
					isMusic: false
				}))
			]
			setSearchResult(structuredData)
		}
	}, [data])

	return (
		<header className="sticky top-0 flex items-center justify-between bg-white px-6  shadow-md min-h-[80px] z-50 w-full">
			{user && (
				<div className="relative w-96">
					<form className="max-w-md mx-auto h-[40px]" id="search-bar">
						<CustomSearchbar
							emptyContent="No results found"
							header
							variant="bordered"
							radius="sm"
							isVirtualized={false}
							classNames={{
								base: "max-w-xs",
								listboxWrapper: "max-h-[320px]",
								selectorButton: "hidden"
							}}
							popoverProps={{
								offset: 10,
								classNames: {
									base: "rounded",
									content: "p-1 border border-default-100 bg-background"
								},
								isOpen: true,
								defaultOpen: true
							}}
							inputProps={{
								classNames: {
									input: "ml-1",
									inputWrapper: "h-[40px]"
								}
							}}
							options={searchResult}
							onSearch={(text) => setSearch(text || "")}
							placeholder="Search projects, tracks, artists..."
							startContent={
								<SearchIcon
									className="text-default-400"
									size={20}
									strokeWidth={2.5}
								/>
							}
							onSelect={(item) => console.info("Selected item:", item)}
							listboxProps={{
								hideSelectedIcon: false,
								itemClasses: {
									base: [
										"rounded",
										"text-default-500",
										"transition-opacity",
										"data-[hover=true]:text-foreground",
										"dark:data-[hover=true]:bg-default-50",
										"data-[pressed=true]:opacity-70",
										"data-[hover=true]:bg-default-200",
										"data-[selectable=true]:focus:bg-default-100",
										"data-[focus-visible=true]:ring-default-500"
									]
								}
							}}
						>
							{(item: any) => (
								<AutocompleteItem
									key={(item as Collaborator | ProjectDataType)?._id}
									textValue={item?.name}
								>
									<div
										className="flex justify-between items-center"
										onClick={() => {
											if (item?.isProject) {
												router.push(`/project/${item?._id}`)
											} else if (item?.isArtist) {
												router.push(`/profile/${item?._id}`)
											} else if (item?.isMusic) {
												addState("mediaPlayer", {
													item: item,
													audioUrl: item?.url,
													coverUrl: item?.artwork || TRACK_THUMBNAIL,
													title: item?.name || "",
													artist: item?.user?.name || "",
													duration: item?.duration || 0,
													extension: getMediaType(`sample.${item?.extension}`),
													videoUrl: item?.url
												})
											}
										}}
									>
										<div className="flex gap-2 items-center">
											<Avatar
												alt={(item as Collaborator | ProjectDataType)?.name}
												className="flex-shrink-0"
												size="sm"
												src={(item as Collaborator | ProjectDataType)?.avatar}
											/>
											<div className="flex flex-col">
												<span className="text-small">
													{(item as Collaborator | ProjectDataType)?.name}
												</span>
												<span className="text-tiny text-default-400">
													{renderType(item)}
												</span>
											</div>
										</div>
									</div>
								</AutocompleteItem>
							)}
						</CustomSearchbar>
					</form>
				</div>
			)}
			<div
				className={`flex items-center gap-6 ${!user && "justify-end w-full "}`}
			>
				<span id="connect-wallet-btn" className="justify-self-end">
					<WalletAuth />
				</span>
				{!user && (
					<Button
						type="button"
						onPress={() => {
							router.push("/login")
						}}
						className="w-[92px] h-[48px] px-5 py-3 gap-2 rounded-lg bg-[#DDF5E5] text-[#0D5326] font-bold"
					>
						Login
					</Button>
				)}
				{user && (
					<>
						<NotificationsDropdown />
						<div className="w-10 h-10 bg-gray-300 rounded-full">
							<Dropdown placement="bottom-end" className="p-4">
								<DropdownTrigger>
									<Avatar
										isBordered
										as="button"
										className="transition-transform h-10 w-10"
										src={userData?.profile_img || PROFILE_IMAGE.src}
									/>
								</DropdownTrigger>
								<DropdownMenu aria-label="Profile Actions" variant="flat">
									<DropdownItem
										showDivider
										key="profile"
										className="h-12 text-base font-semibold"
										onPress={() => {
											updateState("fromSubscription", false)
											router.push("/profile")
										}}
									>
										Profile
									</DropdownItem>
									<DropdownItem
										showDivider
										key="profile"
										className="h-12 text-base font-semibold"
										onPress={() => router.push("/featured-livestream")}
									>
										Livestreams
									</DropdownItem>
									<DropdownItem
										showDivider
										key="profile"
										className="h-12 text-base font-semibold"
										onPress={() =>
											showCustomModal({
												customModalType: INVITE_FRIENDS_MODAL,
												tempCustomModalData: {
													initialKey: "email"
												}
											})
										}
									>
										Invite friends
									</DropdownItem>
									<DropdownItem
										showDivider
										key="profile"
										className="h-12 text-base font-semibold"
										onPress={() => addState("TakeTour", true)}
									>
										Take a tour
									</DropdownItem>
									<DropdownItem
										showDivider
										key="missions"
										className="h-12 text-base font-semibold"
										onPress={() => router.push("/mission-history")}
									>
										Mission History
									</DropdownItem>
									<DropdownItem
										showDivider
										key="affiliate_center"
										className="h-12 text-base font-semibold"
										onPress={() => router.push("/subscription")}
									>
										Upgrade
									</DropdownItem>
									<DropdownItem
										key="logout"
										className="h-12 text-base font-semibold"
										color="danger"
										onPress={handleModal}
									>
										Log Out
									</DropdownItem>
								</DropdownMenu>
							</Dropdown>
						</div>
					</>
				)}
			</div>
		</header>
	)
}
