import { FetchMediaList } from "@/app/api/mutation"
import { useMutation } from "@tanstack/react-query"

import { useDynamicStore } from "@/stores"

const useMediaList = () => {
	const {
		tracksFilterData,
		tracksSortData,
		addState,
		tablePagination,
		isReleaseVideo
	} = useDynamicStore()

	const { mutate: fetchMediaDataList, isPending } = useMutation({
		mutationFn: () => {
			const payload = {
				...(tracksFilterData?.filters || {}),
				...(tracksSortData?.sortOrder
					? { sortOrder: tracksSortData.sortOrder }
					: {}),
				page: tablePagination?.page || 1,
				limit: tablePagination?.limit || 10,
				...(isReleaseVideo ? { trackType: "video" } : {})
			}
			return FetchMediaList({ payload })
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
		fetchMediaDataList,
		isPending
	}
}

export default useMediaList
