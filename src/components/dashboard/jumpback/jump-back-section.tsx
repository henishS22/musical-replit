import { useRouter } from "next/navigation"

import { fetchUserProjects } from "@/app/api/query"
import { ProjectDataType } from "@/types/dashboarApiTypes"
import { Button, Skeleton } from "@nextui-org/react"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"

import { useDynamicStore, useUserStore } from "@/stores"

import { JumpBackCard } from "./jump-back-card"

export function JumpBackSection({
	selectedValue
}: {
	selectedValue: { startDate?: Date; endDate?: Date } | undefined
}) {
	const { removeState } = useDynamicStore()
	const { user } = useUserStore()
	const router = useRouter()
	//#region Fetch Users Projects
	const { isPending, data } = useQuery({
		queryKey: [
			"userProjects",
			selectedValue?.startDate,
			selectedValue?.endDate
		],
		enabled: !!user?.id,
		queryFn: () => {
			const baseQuery = "limit=10"
			const startDateQuery =
				selectedValue && selectedValue.startDate && selectedValue.endDate
					? `&startDate=${format(selectedValue.startDate, "yyyy-MM-dd")}&endDate=${format(selectedValue.endDate, "yyyy-MM-dd")}`
					: ""
			return fetchUserProjects(`/${user?.id}?${baseQuery}${startDateQuery}`)
		},
		staleTime: 20000
	})

	return (
		<div>
			<div className="flex flex-wrap gap-6">
				<>
					{isPending ? (
						<>
							{Array.from({ length: 4 }).map((_, index) => (
								<Skeleton
									key={index}
									className="rounded-lg h-[234px] w-[234px]"
									isLoaded={!isPending}
								></Skeleton>
							))}
						</>
					) : (
						<>
							{data?.projects?.length > 0 ? (
								data?.projects?.map((item: ProjectDataType) => (
									<div
										key={item._id}
										onClick={() => router.push(`project/${item?._id}`)}
									>
										<JumpBackCard
											key={item._id}
											title={item?.name}
											timestamp={item?.updatedAt}
											imageUrl={item?.artworkUrl}
										/>
									</div>
								))
							) : (
								<div className="flex flex-col gap-2 justify-center items-center w-full">
									<span className="text-sm font-medium text-gray-500 leading-normal">
										There are no project to show
									</span>
									<Button
										variant="flat"
										color="default"
										onPress={() => {
											removeState("collabData")
											removeState("trackId")
											router.push("/create-project")
										}}
										className="h-10 px-2 text-sm text-black font-semibold bg-[#FCFCFC] border-2 border-customGray hover:bg-gray-100 rounded-lg  py-2.5 me-2 mb-2 "
									>
										{" "}
										Create New Project
									</Button>
								</div>
							)}
						</>
					)}
				</>
			</div>
			{data?.length > 4 && (
				<div className="flex justify-center">
					<Button
						variant="flat"
						size="sm"
						className="h-10 px-2 text-sm text-black font-semibold bg-[#FCFCFC] border-2 border-customGray hover:bg-gray-100 rounded-lg  py-2.5 me-2 mb-2 "
						color="default"
					>
						View All
					</Button>
				</div>
			)}
		</div>
	)
}
