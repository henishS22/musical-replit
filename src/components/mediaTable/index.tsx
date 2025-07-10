import { MediaListProps } from "@/types"

import { useDynamicStore } from "@/stores"

import { MediaGridTable } from "./gridView"
import { MediaListTable } from "./tableView"

export const MediaTable = ({
	mediaItems,
	onAction,
	isLoading,
	folderId,
	className = ""
}: MediaListProps) => {
	const { viewType } = useDynamicStore()
	return (
		<div className={className}>
			{viewType === "list" ? (
				<MediaListTable
					mediaItems={mediaItems}
					onAction={onAction}
					isLoading={isLoading}
					folderId={folderId}
				/>
			) : (
				<MediaGridTable
					mediaItems={mediaItems}
					onAction={onAction}
					isLoading={isLoading}
					folderId={folderId}
				/>
			)}
		</div>
	)
}
