"use client"

import React from "react"

import { fetchLocalization } from "@/app/api/query"
import { useQuery } from "@tanstack/react-query"

interface InfoFieldProps {
	label: string
	value: string
	description?: string
}

const InfoField: React.FC<InfoFieldProps> = ({ label, value }) => (
	<div className="flex flex-col w-full max-md:max-w-full">
		<div className="gap-1 self-stretch my-auto text-sm font-semibold tracking-normal leading-6 text-neutral-700">
			{label}
		</div>

		<div className="overflow-hidden gap-2.5 self-stretch mt-1 w-full text-sm font-medium tracking-normal leading-6 text-gray-500 max-md:max-w-full">
			{value}
		</div>
	</div>
)

const ProfileInfo: React.FC<{ username: string; bio: string; id: string }> = ({
	username,
	bio,
	id
}) => {
	const { data: localization } = useQuery({
		queryKey: ["localization"],
		queryFn: () => fetchLocalization(id),
		enabled: !!id
	})

	return (
		<div className="flex flex-col mt-6 w-full max-md:max-w-full gap-[22px]">
			<InfoField label="Username" value={username || "N/A"} />
			<InfoField label="Bio" value={bio || "N/A"} />
			<div className="flex flex-wrap gap-8">
				<div className="flex-1">
					<InfoField
						label="COUNTRY"
						value={localization?.country?.name || "N/A"}
					/>
				</div>
				<div className="flex-1">
					<InfoField label="STATE" value={localization?.state?.name || "N/A"} />
				</div>
			</div>

			<InfoField label="City" value={localization?.city?.name || "N/A"} />
		</div>
	)
}

export default ProfileInfo
