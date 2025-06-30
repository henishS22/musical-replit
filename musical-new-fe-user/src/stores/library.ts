import { create } from "zustand"
import { persist } from "zustand/middleware"
import { FilterFormData } from "@/components/modal/filterModal"
import { Genre, Instruments, Tag } from "@/types"

// Define the store state and actions
type StoreState = {
	tags: Tag[]
	instruments: Instruments[]
	genres: Genre[]
	appliedFilters: FilterFormData
	setData: (
		key: keyof StoreState,
		data: Tag[] | Instruments[] | Genre[] | FilterFormData
	) => void
	clearLibraryStore: () => void
}

const useLibraryStore = create(
	persist<StoreState>(
		(set) => ({
			tags: [],
			instruments: [],
			genres: [],
			appliedFilters: {
				genres: [],
				instruments: [],
				tags: [],
				bpm: []
			},
			setData: (key, data) => set({ [key]: data }),
			clearLibraryStore: () =>
				set({
					tags: [],
					instruments: [],
					genres: [],
					appliedFilters: { genres: [], instruments: [], tags: [], bpm: [] }
				})
		}),
		{
			name: "library-storage" // name of the item in local storage
		}
	)
)

export default useLibraryStore
