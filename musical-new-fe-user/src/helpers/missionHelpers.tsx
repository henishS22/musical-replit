import Image from "next/image"

import {
	EMAIL_ICON,
	FACEBOOK_ICON,
	INSTAGRAM_ICON,
	TEXT_ICON,
	TIKTOK_ICON,
	TWITTER_ICON
} from "@/assets"

export const XIcon = () => (
	<Image src={TWITTER_ICON} alt="X" className="rounded-lg" />
)

export const TikTokIcon = () => <Image src={TIKTOK_ICON} alt="TikTok" />

export const InstagramIcon = () => (
	<Image src={INSTAGRAM_ICON} alt="Instagram" />
)

export const FacebookIcon = () => <Image src={FACEBOOK_ICON} alt="Facebook" />

export const EmailIcon = () => <Image src={EMAIL_ICON} alt="Email" />

export const TextIcon = () => <Image src={TEXT_ICON} alt="Sms" />

export const MissionsIconMap: Record<string, React.ReactNode> = {
	connect_x: <XIcon />,
	connect_tiktok: <TikTokIcon />,
	connect_instagram: <InstagramIcon />,
	connect_facebook: <FacebookIcon />,
	x_post_and_mention: <XIcon />,
	tiktok_post_and_mention: <TikTokIcon />,
	instagram_post_and_mention: <InstagramIcon />,
	facebook_post_and_mention: <FacebookIcon />,
	sign_up_for_email: <EmailIcon />,
	sign_up_for_text: <TextIcon />
}

export const MissionsEndPointMap: Record<string, string> = {
	connect_x: "x",
	connect_tiktok: "tiktok",
	connect_instagram: "instagram",
	connect_facebook: "facebook",
	x_post_and_mention: "x-post",
	tiktok_post_and_mention: "tiktok-post",
	instagram_post_and_mention: "instagram-post",
	facebook_post_and_mention: "facebook-post",
	sign_up_for_email: "signup-email",
	sign_up_for_text: "signup-text"
}

export const MissionsPostMap: Record<string, string> = {
	x_post_and_mention: "X",
	tiktok_post_and_mention: "Tiktok",
	instagram_post_and_mention: "Instagram",
	facebook_post_and_mention: "Facebook"
}
