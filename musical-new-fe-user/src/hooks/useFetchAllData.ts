import { fetchGenre, fetchInstruments, fetchTags } from "@/app/api/query"
import { useQuery } from "@tanstack/react-query"

const useFetchAllData = () => {
	const { data: genreQuery } = useQuery({
		queryKey: ["genreList"],
		queryFn: () => fetchGenre("en"),
		staleTime: 1000 * 60 * 5
	})

	const { data: instrumentQuery } = useQuery({
		queryKey: ["instrumentList"],
		queryFn: () => fetchInstruments("en"),
		staleTime: 1000 * 60 * 5
	})

	const { data: tagsQuery } = useQuery({
		queryKey: ["tagsList"],
		queryFn: () => fetchTags("en"),
		staleTime: 1000 * 60 * 5
	})

	return {
		genreQuery,
		instrumentQuery,
		tagsQuery
	}
}

export default useFetchAllData
