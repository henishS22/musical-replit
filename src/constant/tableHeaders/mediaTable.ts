import { Track } from "@/types"
import { Header } from "@/types/customTableTypes"

export const headers: Header<Track>[] = [
	{
		title: "Song/Video Name",
		key: "name" as keyof Track
	},
	{
		title: "Genre",
		key: "genre" as keyof Track
	},
	{
		title: "Instrument",
		key: "instrument" as keyof Track
	},
	{
		title: "Action",
		key: "action" as keyof Track
	}
]
