import { useFormContext } from "react-hook-form"

import { Select, SelectItem } from "@nextui-org/react"

import { livestreamOptions } from "@/config/liveStream"

import { TitleBadgeCard } from "../ui"

const LivestreamType = () => {
	const {
		formState: { errors },
		setValue,
		watch
	} = useFormContext()
	return (
		<TitleBadgeCard
			markColor="#B1E5FC"
			title="Livestream Type"
			titleClassName="!mb-0"
		>
			<div className="flex flex-col mt-8 w-full">
				<Select
					placeholder="Select livestream type"
					selectedKeys={
						watch("livestreamType") ? [watch("livestreamType")] : []
					}
					onChange={(e) =>
						setValue("livestreamType", e.target.value, { shouldDirty: true })
					}
					classNames={{
						trigger:
							"h-[56px] px-6 border-2 border-customGray data-[hover=true]:border-customGray rounded-xl bg-white",
						value: "text-[15px] text-gray-500",
						base: "w-full"
					}}
				>
					{livestreamOptions.map((option, index) => (
						<SelectItem
							key={option.key}
							value={option.key}
							classNames={{ title: "text-[15px] text-gray-500 p-0" }}
							className={`"py-3 text-[15px] data-[hover=true]:bg-gray-50 data-[selected=true]:bg-gray-50" ${
								livestreamOptions.length - 1 === index
									? ""
									: "border-b-2 border-customGray"
							}`}
						>
							{option.label}
						</SelectItem>
					))}
				</Select>
				{errors.livestreamType && (
					<p className="text-red-500 text-sm mt-2">
						{errors.livestreamType.message as string}
					</p>
				)}
			</div>
		</TitleBadgeCard>
	)
}

export default LivestreamType
