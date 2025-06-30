import { FetchMediaContent } from "@/app/api/mutation"
import { useMutation } from "@tanstack/react-query"

import { useDynamicStore } from "@/stores"

const useFolderMediaList = () => {
	const { tracksFilterData, tracksSortData, addState, tablePagination } =
		useDynamicStore()
	const { mutate: fetchMediaContentList, isPending } = useMutation({
		mutationFn: (id: string) => {
			const payload = {
				...(tracksFilterData?.filters || {}),
				...(tracksSortData?.sortOrder
					? { sortOrder: tracksSortData.sortOrder }
					: {}),
				page: tablePagination?.page || 1,
				limit: tablePagination?.limit || 10,
				folderID: id
			}
			return FetchMediaContent({ payload })
		},
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		onSuccess: (data: any) => {
			if (data) {
				addState("mediaList", {
					data: data?.data
				})
			}
		}
	})

	return {
		fetchMediaContentList,
		isPending
	}
}

export default useFolderMediaList
