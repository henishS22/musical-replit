"use client"

import React from "react"

import { CollaborationInterest, CollaborationSetup } from "@/stores/user"

interface InterestFieldProps {
	label: string
	items: CollaborationInterest[] | CollaborationSetup[]
	description?: string
}

const InterestField: React.FC<InterestFieldProps> = ({ label, items }) => (
	<div className="flex flex-col flex-1 shrink leading-6 basis-0 min-w-[240px] max-md:max-w-full">
		<div className="flex gap-3 items-center w-full text-sm tracking-normal text-neutral-700 max-md:max-w-full">
			<div className="flex flex-1 shrink gap-2 items-center self-stretch py-0.5 my-auto w-full basis-0 min-w-[240px] max-md:max-w-full">
				<div className="flex gap-1 items-center self-stretch my-auto">
					<div className="self-stretch my-auto">{label}</div>
					<div className="flex shrink-0 self-stretch my-auto w-4 h-4" />
				</div>
			</div>
		</div>
		<div className="flex gap-1 items-start self-start mt-1 text-xs tracking-normal text-gray-500 flex-wrap">
			{items.length > 0 ? (
				items.map((item, index) => (
					<div
						key={index}
						className="flex flex-col px-2 rounded-lg border border-solid border-zinc-100"
					>
						<div className="gap-1.5 self-stretch w-full">{item.title.en}</div>
					</div>
				))
			) : (
				<div className="flex flex-col rounded-lg border border-solid border-zinc-100">
					<div className="gap-1.5 self-stretch w-full">No {label} added</div>
				</div>
			)}
		</div>
	</div>
)

const CollaborationInterests: React.FC<{
	clb_interest: CollaborationInterest[]
	clb_setup: CollaborationSetup[]
	clb_availability: string
}> = ({ clb_interest, clb_setup, clb_availability }) => {
	return (
		<>
			<div className="flex mt-8 w-full rounded-sm bg-zinc-100 min-h-[1px] max-md:max-w-full" />
			<div className="flex flex-col mt-8 w-full max-md:max-w-full">
				<div className="flex flex-wrap gap-10 justify-between items-center w-full text-zinc-900 max-md:max-w-full">
					<div className="gap-4 self-stretch my-auto text-xl font-semibold tracking-tight leading-relaxed">
						Collaboration Interests
					</div>
				</div>
				<div className="flex flex-col mt-5 w-full font-medium max-md:max-w-full">
					<div className="flex flex-col w-full max-md:max-w-full">
						<div className="flex flex-wrap gap-8 items-start w-full max-md:max-w-full">
							<InterestField label="What you play" items={clb_interest || []} />
							<InterestField
								label="Genre Interest"
								items={clb_setup || []}
								description="Description"
							/>
						</div>
						<div className="flex flex-col mt-3 w-full max-md:max-w-full">
							<div className="flex flex-wrap gap-2 items-center py-0.5 w-full max-md:max-w-full">
								<div className="gap-1 self-stretch my-auto text-sm tracking-normal leading-6 text-neutral-700">
									Time Availability
								</div>
							</div>
							<div className="mt-1 text-sm tracking-normal leading-6 text-gray-500 max-md:max-w-full">
								{clb_availability}
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default CollaborationInterests
