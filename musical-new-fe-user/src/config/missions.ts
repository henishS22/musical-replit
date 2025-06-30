export const fanMissions = [
	{
		icon: "twitter",
		title: "Connect Twitter",
		description:
			"Connect Twitter to earn points. Provide your Public Profile URL.",
		points: 10,
		action: "Connect",
		identifier: "connect_x"
	},
	{
		icon: "tiktok",
		title: "Connect TikTok",
		description:
			"Connect TikTok to earn points. Provide your Public Profile URL.",
		points: 10,
		action: "Connect",
		identifier: "connect_tiktok"
	},
	{
		icon: "instagram",
		title: "Connect Instagram",
		description:
			"Connect Instagram to earn points. Provide your Public Profile URL.",
		points: 10,
		action: "Connect",
		identifier: "connect_instagram"
	},
	{
		icon: "facebook",
		title: "Connect Facebook",
		description:
			"Connect Facebook to earn points. Provide your Public Profile URL.",
		points: 10,
		action: "Connect",
		identifier: "connect_facebook"
	},
	{
		icon: "email",
		title: "Sign up for Email",
		description:
			"Provide your email address to receive emails and News letters over the email.",
		points: 10,
		action: "Sign up",
		identifier: "sign_up_for_email"
	},
	{
		icon: "sms",
		title: "Sign up for Text",
		description:
			"Provide your mobile number to receive emails and News letters over the phone.",
		points: 10,
		action: "Sign up",
		identifier: "sign_up_for_text"
	}
]

export const creatorMissions = [
	{
		icon: "twitter",
		title: "Post and Mention on Twitter",
		points: 10,
		action: "Start",
		identifier: "x_post_and_mention"
	},
	{
		icon: "tiktok",
		title: "Post and Mention on Tiktok",
		points: 10,
		action: "Start",
		identifier: "tiktok_post_and_mention"
	},
	{
		icon: "instagram",
		title: "Post and Mention on Instagram",
		points: 10,
		action: "Start",
		identifier: "instagram_post_and_mention"
	},
	{
		icon: "facebook",
		title: "Post and Mention on Facebook",
		points: 10,
		action: "Start",
		identifier: "facebook_post_and_mention"
	}
]

export const missionPlaceholders: Record<string, string> = {
	connect_x: "Enter your profile URL",
	connect_tiktok: "Enter your profile URL",
	connect_instagram: "Enter your profile URL",
	connect_facebook: "Enter your profile URL",
	sign_up_for_email: "Enter your email address",
	sign_up_for_text: "Enter your mobile number"
}
