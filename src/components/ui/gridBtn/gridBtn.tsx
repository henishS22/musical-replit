import { useEffect } from "react"

import { ListBulletIcon } from "@/assets/icons/ListBulletIcon"
import { Button } from "@nextui-org/react"
import { LayoutGrid } from "lucide-react"

import { useDynamicStore } from "@/stores"

const GridBtn = () => {
	const { addState, viewType } = useDynamicStore()

	const handleViewType = (type: string) => {
		addState("viewType", type)
	}
	useEffect(() => {
		if (!viewType) {
			addState("viewType", "list")
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<div>
			<Button
				isIconOnly
				variant="light"
				onPress={() => handleViewType("list")}
				// className={viewType === "list" ? "bg-gray-200" : ""}
			>
				<ListBulletIcon
					className="h-5 w-5"
					fill={viewType === "list" ? "" : "#000000"}
				/>
			</Button>
			<Button
				isIconOnly
				variant="light"
				onPress={() => handleViewType("grid")}
				// className={viewType === "grid" ? "bg-gray-200" : ""}
			>
				<LayoutGrid
					className="h-5 w-5"
					color={viewType === "grid" ? "#1DB653" : "#000000"}
				/>
			</Button>
		</div>
	)
}

export default GridBtn
