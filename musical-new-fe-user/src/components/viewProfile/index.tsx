"use client"

import React, { useState } from "react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"

import { fetchUserData } from "@/app/api/query"
import { COVER_IMAGE, PROFILE_IMAGE } from "@/assets"
import { Button } from "@nextui-org/react"
import { useQuery } from "@tanstack/react-query"

import { useUserStore } from "@/stores"

import CollabInterest from "./CollabInterest"
import Missions from "./missions/Missions"
import UserProfileTab from "./UserProfileTab"

const ViewProfile: React.FC = () => {
	const [activeTab, setActiveTab] = useState("Profile")
	const router = useRouter()
	const { userData } = useUserStore()
	const { id } = useParams()

	const tabs = ["Profile", "Collaboration", "Missions"]

	const { data: userDetails } = useQuery({
		queryKey: ["userProfile", id],
		queryFn: () => fetchUserData(id as string),
		enabled: !!id
	})

	const renderTabContent = () => {
		switch (activeTab) {
			case "Profile":
				return <UserProfileTab userDetails={userDetails} id={id as string} />
			case "Collaboration":
				return <CollabInterest userDetails={userDetails} />
			case "Missions":
				return <Missions />
			default:
				return null
		}
	}

	return (
		<div>
			<div className="relative">
				<Image
					src={userDetails?.cover_img || COVER_IMAGE}
					alt="cover"
					className="w-full h-[218px] rounded-lg"
					width={1000}
					height={218}
				/>
			</div>
			<div className="flex flex-col bg-white rounded-xl max-md:px-5 w-[calc(100%-40px)] relative mx-auto mt-[-60px] p-6 pt-0">
				<div className="flex justify-between items-center min-h-[74px]">
					<div className="absolute top-[-96px] left-[23px]">
						<div className=" w-[198px] h-[198px]">
							<Image
								src={userDetails?.profile_img || PROFILE_IMAGE}
								className={`object-contain shrink-0 self-stretch my-auto aspect-[1.09] w-[198px] rounded-full h-[198px] border-4 border-white ${userDetails?.isGuildedProfileImage
									? 'outline outline-[5px] outline-[#FFCC33]'
									: 'outline outline-2 outline-gray-300'
									}`}
								alt="profile"
								width={198}
								height={198}
							/>
						</div>
					</div>
					<div className="flex justify-end items-center font-manrope font-bold text-[32px] leading-[40px] tracking-[-0.03em] ml-[240px]">
						{userDetails?.name}
					</div>
					{userData?._id === id && (
						<Button
							className="bg-videoBtnGreen text-[#1db954] "
							onPress={() => router.push(`/profile`)}
						>
							Back to private view
						</Button>
					)}
				</div>
				<div className="flex flex-wrap gap-2 items-start w-full text-base font-medium tracking-normal leading-relaxed text-gray-500 mt-[60px] max-md:max-w-full">
					{tabs.map((tab, index) => (
						<div
							key={index}
							className={`gap-10 self-stretch px-4 py-2 rounded-lg bg-zinc-100 text-zinc-900 cursor-pointer ${activeTab === tab ? "bg-zinc-100 text-zinc-900" : "bg-zinc-50"}`}
							onClick={() => setActiveTab(tab)}
						>
							{tab}
						</div>
					))}
				</div>
				{renderTabContent()}
			</div>
		</div>
	)
}

export default ViewProfile
