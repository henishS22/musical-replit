import { TriangleAlert } from "lucide-react"

export const NoDataFound = ({
	message = "No Data Found"
}: {
	message?: string
}) => {
	return (
		<div className="flex flex-col items-center justify-center w-full">
			<div className="">
				<div className="flex flex-col items-center">
					<TriangleAlert size={48} className="text-gray-400 mb-2" />
					<div className="font-bold text-gray-400 text-xl">{message}</div>
				</div>
			</div>
		</div>
	)
}
