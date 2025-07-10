import { useDynamicStore } from "@/stores"

export const usePaginationData = () => {
	const { addState } = useDynamicStore()

	const handlePaginationChange = (page: number) => {
		addState("tablePagination", {
			page: page,
			limit: 10
		})
	}

	return { handlePaginationChange }
}
