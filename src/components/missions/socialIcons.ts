import { StaticImageData } from "next/image"

import {
	EMAIL_ICON,
	FACEBOOK_ICON,
	INSTAGRAM_ICON,
	TEXT_ICON,
	TIKTOK_ICON,
	TWITTER_ICON
} from "@/assets"

export const SocialIcons: { [key: string]: StaticImageData } = {
	instagram_post_and_mention: INSTAGRAM_ICON,
	facebook_post_and_mention: FACEBOOK_ICON,
	x_post_and_mention: TWITTER_ICON,
	tiktok_post_and_mention: TIKTOK_ICON,
	connect_instagram: INSTAGRAM_ICON,
	connect_facebook: FACEBOOK_ICON,
	connect_tiktok: TIKTOK_ICON,
	connect_x: TWITTER_ICON,
	sign_up_for_email: EMAIL_ICON,
	sign_up_for_text: TEXT_ICON
}
