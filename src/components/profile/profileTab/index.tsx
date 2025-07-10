"use client"

import { useUserStore } from "@/stores"

import CollaborationInterests from "./CollaborationInterests"
import ProfileInfo from "./ProfileInfo"
import SocialMedia from "./SocialMedia"
import StylesAndSkills from "./StylesAndSkills"

const ProfileTab: React.FC = () => {
	const { userData } = useUserStore()
	const socialLinks = [
		{ platform: "Spotify", url: userData?.spotify || "" },
		{ platform: "Apple", url: userData?.apple_music || "" },
		{ platform: "Youtube", url: userData?.youtube || "" },
		{ platform: "Instagram", url: userData?.instagram || "" },
		{ platform: "TikTok", url: userData?.tiktok || "" },
		{ platform: "X", url: userData?.twitter || "" }
	]
	return (
		<>
			<ProfileInfo
				username={userData?.username || ""}
				bio={userData?.descr || ""}
				id={userData?._id || ""}
			/>
			<CollaborationInterests
				clb_interest={userData?.clb_interest || []}
				clb_setup={userData?.clb_setup || []}
				clb_availability={userData?.clb_availability || ""}
			/>
			<SocialMedia socialLinks={socialLinks} />
			<StylesAndSkills
				preferredStyles={userData?.preferredStyles || []}
				skills={userData?.skills || []}
			/>
		</>
	)
}

export default ProfileTab
