"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

import { MediaList } from "@/components/mediaList"
import GridBtn from "@/components/ui/gridBtn/gridBtn"
import { BreadcrumbItem, Breadcrumbs, Button } from "@nextui-org/react"
import { ChevronLeft } from "lucide-react"

import { useDynamicStore } from "@/stores"
import useFolderMediaList from "@/hooks/useFolderMediaList"

export const FolderContent = () => {
	const router = useRouter()
	const params = useParams()

	const {
		mediaList,
		tracksFilterData,
		tracksSortData,
		tablePagination,
		folderName
	} = useDynamicStore()
	const { isPending: isFolderDeleteLoading, fetchMediaContentList } =
		useFolderMediaList()
	const id = decodeURIComponent(params?.id as string)
	useEffect(() => {
		if (id) {
			fetchMediaContentList(id)
		}
	}, [
		id,
		fetchMediaContentList,
		tracksFilterData,
		tracksSortData,
		tablePagination
	])
	const handleBack = () => {
		router.push("/library")
	}
	return (
		<div className="p-4 bg-white rounded-xl">
			{/* Header section */}
			<div className="flex justify-between items-center mb-6">
				<div className="flex items-center">
					<Button isIconOnly variant="light" onPress={() => handleBack()}>
						<ChevronLeft className="h-5 w-5" />
					</Button>
					<Breadcrumbs>
						<BreadcrumbItem onClick={() => handleBack()}>
							My Folders
						</BreadcrumbItem>
						<BreadcrumbItem>{folderName}</BreadcrumbItem>
					</Breadcrumbs>
				</div>

				<div className="flex gap-2">
					{/* View toggle buttons */}
					<GridBtn />
				</div>
			</div>

			{/* Media List */}
			<MediaList
				mediaItems={mediaList?.data}
				isLoading={isFolderDeleteLoading}
				folderId={id}
			/>
		</div>
	)
}
