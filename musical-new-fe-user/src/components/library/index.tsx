/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

"use client"

import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"

import { UpdateFolder } from "@/app/api/mutation"
import { fetchFoldersList } from "@/app/api/query"
import { CONFIRMATION_MODAL, CREATE_FOLDER_MODAL } from "@/constant/modalType"
import { FOLDER_DELETED_SUCCESSFULLY } from "@/constant/toastMessages"
import {
	Button,
	Card,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
	Skeleton
} from "@nextui-org/react"
import { useMutation, useQuery } from "@tanstack/react-query"
import {
	Folder,
	MoreVertical,
	Pencil,
	Plus,
	Trash2,
	Upload
} from "lucide-react"

import { useDynamicStore, useModalStore } from "@/stores"
import useMediaList from "@/hooks/useMediaList"

import { MediaList } from "../mediaList"
import { CreateFolderModal } from "../modal/createFolderModal"
import { NoDataFound } from "../ui"

export interface Folder {
	_id: string | number
	name: string
	// ... any other properties your folder might have
}

export const LibraryContent = () => {
	const router = useRouter()
	const [folderId, setFolderId] = useState<string | number>("")
	const [folderName, setFolderName] = useState<string>("")
	const {
		tracksFilterData,
		tracksSortData,
		mediaList,
		addState,
		isReleaseVideo,
		tablePagination,
		removeState
	} = useDynamicStore()

	const { showCustomModal, hideCustomModal, setCustomModalLoading } =
		useModalStore()
	const { isPending: isMediaDeleteLoading, fetchMediaDataList } = useMediaList()
	const {
		isPending,
		data: folderList,
		refetch
	} = useQuery({
		queryKey: ["folderList"],
		queryFn: () => {
			return fetchFoldersList()
		},
		staleTime: 20000
	})

	const { mutate: deleteFolder, isPending: isFolderDeleteLoading } =
		useMutation({
			mutationFn: () => {
				setCustomModalLoading(true)
				return UpdateFolder({ payload: { id: folderId }, method: "DELETE" })
			},
			onSuccess: (data) => {
				if (data) {
					toast.success(FOLDER_DELETED_SUCCESSFULLY)
					refetch()
					setCustomModalLoading(false)
					hideCustomModal()
				}
			}
		})

	const handleFolderClick = (id: string, name: string) => {
		router.push(`/library/${id}`)
		addState("folderName", name)
	}

	const handleFolderAction = (
		action: string,
		folderData: { _id: number | string; name: string }
	) => {
		setFolderId(folderData?._id)
		setFolderName(folderData?.name)
		switch (action) {
			case "move":
				break
			case "delete":
				showCustomModal({
					customModalType: CONFIRMATION_MODAL,
					modalFunction: deleteFolder,
					tempCustomModalData: {
						title: "Confirmation",
						msg: "Are you sure want to delete this folder?",
						isLoading: isFolderDeleteLoading
					}
				})
				break
			case "rename":
				showCustomModal({ customModalType: CREATE_FOLDER_MODAL })
				break
		}
	}

	const handleCreateFolder = () => {
		setFolderName("")
		setFolderId("")
		refetch()
		hideCustomModal()
		// setFolders(prev => [...prev, { id: prev.length + 1, name: data.name }])
	}

	const renderSkeletons = () => {
		return Array(6)
			.fill(null)
			.map((_, index) => (
				<Card key={`skeleton-${index}`} className="p-4">
					<div className="flex justify-between items-center">
						<div className="flex items-center gap-2">
							<Skeleton className="w-5 h-5 rounded" />
							<Skeleton className="w-24 h-4 rounded" />
						</div>
						<Skeleton className="w-8 h-8 rounded-full" />
					</div>
				</Card>
			))
	}

	useEffect(() => {
		if (folderList?.data) {
			addState("folderList", {
				data: folderList?.data
			})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [folderList?.data])

	useEffect(() => {
		fetchMediaDataList()
	}, [
		fetchMediaDataList,
		tracksFilterData,
		tracksSortData,
		tablePagination,
		isReleaseVideo
	])

	return (
		<div className="p-4 bg-white rounded-xl">
			{/* Header section */}
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">My Folders</h1>

				<div className="flex gap-2">
					{/* Create and Upload buttons */}
					<Button
						variant="flat"
						className="border border-[#1DB954] text-[#1DB954] font-bold bg-transparent"
						onPress={() =>
							showCustomModal({ customModalType: CREATE_FOLDER_MODAL })
						}
					>
						<Plus className="h-5 w-5" /> Create New Folder
					</Button>
					<Button
						variant="flat"
						className="bg-[#1DB954] text-white"
						onPress={() => {
							removeState("trackId")
							removeState("linkTrack")
							removeState("isReleaseTrack")
							removeState("trackFiles")
							router.push("/upload-new-work")
						}}
					>
						<Upload className="h-5 w-5" /> Upload
					</Button>
				</div>
			</div>

			{/* Folders list/grid view */}
			<div className="flex flex-col gap-2">
				{isPending ? (
					renderSkeletons()
				) : folderList && folderList?.data && folderList?.data?.length > 0 ? (
					folderList?.data?.map((folder: Folder) => (
						<Card key={folder?._id} className="py-3 px-[10px] cursor-pointer">
							<div
								className="flex justify-between items-center"
								onClick={() => handleFolderClick(folder?._id, folder?.name)}
							>
								<div className="flex items-center gap-2">
									<Folder className="h-6 w-6 text-black-500" />
									<span className="font-medium text-[16px] leading-[100%] tracking-[0em]">
										{folder?.name}
									</span>
								</div>
								<Dropdown>
									<DropdownTrigger>
										<Button isIconOnly variant="light" className="min-w-unit-8">
											<MoreVertical className="h-5 w-5" />
										</Button>
									</DropdownTrigger>
									<DropdownMenu
										aria-label="Folder actions"
										onAction={(key) =>
											handleFolderAction(key.toString(), folder)
										}
									>
										<DropdownItem
											key="rename"
											startContent={<Pencil className="h-4 w-4" />}
										>
											Rename
										</DropdownItem>
										<DropdownItem
											key="delete"
											className="text-danger"
											color="danger"
											startContent={<Trash2 className="h-4 w-4" />}
										>
											Delete
										</DropdownItem>
									</DropdownMenu>
								</Dropdown>
							</div>
						</Card>
					))
				) : (
					<div className="col-span-full flex justify-center items-center h-full">
						<NoDataFound />
					</div>
				)}
			</div>

			{/* Media Section */}
			<div className="mt-8">
				<MediaList
					mediaItems={mediaList?.data}
					isLoading={isMediaDeleteLoading}
				/>
			</div>

			{/* Add CreateFolderModal component */}
			<CreateFolderModal
				onCreateFolder={handleCreateFolder}
				folderId={folderId}
				folderName={folderName}
			/>
		</div>
	)
}
