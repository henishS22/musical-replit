import Image, { StaticImageData } from "next/image"

import { ARROWRIGHT_ICON, GREENCHECK_ICON } from "@/assets"
import { Button } from "@nextui-org/react"

interface SubOption {
	title: string
	description: string
	type: string
	value: string
}

interface CreateOption {
	title: string
	icon: string | StaticImageData
	options: SubOption[]
}

interface CreateOptionsListProps {
	createOptions: CreateOption[]
	handleOptionSelect: (subOption: SubOption, modalType: string) => void
	isDisabled?: boolean
}

const CreateOptionsList: React.FC<CreateOptionsListProps> = ({
	createOptions,
	handleOptionSelect,
	isDisabled = false
}) => {
	return (
		<>
			{createOptions?.map((option) => (
				<div key={option.title} className="space-y-6">
					<div className="flex items-center gap-4">
						<div>
							<Image
								src={option.icon}
								width={60}
								height={60}
								alt={option.title}
								className="rounded-xl bg-[#F4F4F4]"
							/>
						</div>
						<div>
							<h3 className="font-medium text-base">{option.title}</h3>
						</div>
					</div>
					<div className="space-y-4">
						{option.options?.map((subOption) => (
							<div
								key={subOption.title}
								className="border border-[#F4F4F4] rounded-lg group hover:bg-gray-50/75 transition-colors overflow-hidden"
							>
								<Button
									className="w-full h-auto min-h-0 font-normal bg-transparent hover:bg-transparent px-4 py-3"
									onPress={() => {
										handleOptionSelect(subOption, subOption.type)
									}}
									isDisabled={isDisabled}
								>
									<div className="flex items-center w-full">
										<div className="flex-shrink-0">
											<Image
												src={GREENCHECK_ICON}
												width={17}
												height={11}
												alt={option.title}
											/>
										</div>
										<div className="flex-1 min-w-0 px-3">
											<p className="text-[13px] text-textPrimary font-medium text-left truncate">
												{subOption.title}
											</p>
											<p className="text-[13px] text-textGray mt-0.5 text-left truncate tracking-tighter">
												{subOption.description}
											</p>
										</div>
										<Image
											src={ARROWRIGHT_ICON}
											width={6}
											height={4}
											alt={"right"}
											className="text-gray-400 group-hover:text-gray-600 flex-shrink-0"
										/>
									</div>
								</Button>
							</div>
						))}
					</div>
				</div>
			))}
		</>
	)
}

export default CreateOptionsList
