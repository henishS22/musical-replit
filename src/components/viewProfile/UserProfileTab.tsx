"use client"

import React from "react"

import { fetchNfts } from "@/app/api/query"
import { generateQueryParams } from "@/helpers"
import { useQuery } from "@tanstack/react-query"

import ProfileInfo from "../profile/profileTab/ProfileInfo"
import SocialMedia from "../profile/profileTab/SocialMedia"
import StylesAndSkills from "../profile/profileTab/StylesAndSkills"
import MadeNFTSection from "../profile/tokenTab/MadeNftSection"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const UserProfileTab: React.FC<{ userDetails: any; id: string }> = ({
	userDetails,
	id
}) => {
	const socialLinks = [
		{ platform: "Spotify", url: userDetails?.spotify || "" },
		{ platform: "Apple", url: userDetails?.apple_music || "" },
		{ platform: "Youtube", url: userDetails?.youtube || "" },
		{ platform: "Instagram", url: userDetails?.instagram || "" },
		{ platform: "TikTok", url: userDetails?.tiktok || "" },
		{ platform: "X", url: userDetails?.twitter || "" }
	]

	const url = generateQueryParams({
		offset: 0,
		limit: "10",
		userId: id,
		includeUsdPrices: true
	})

	const { data: nftsByUser, isFetching } = useQuery({
		queryKey: ["nftListingProfile", id],
		queryFn: () => fetchNfts(url),
		enabled: !!id
	})

	return (
		<>
			<MadeNFTSection
				heading="Gallery"
				nftData={nftsByUser?.data}
				loading={isFetching}
				viewMode="slider"
				basePath="/buy-nft"
			/>
			<ProfileInfo
				username={userDetails?.username || ""}
				bio={userDetails?.descr || ""}
				id={id || ""}
			/>
			<SocialMedia socialLinks={socialLinks} />
			<StylesAndSkills
				preferredStyles={userDetails?.preferredStyles || []}
				skills={userDetails?.skills || []}
			/>
		</>
	)
}

export default UserProfileTab
