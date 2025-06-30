import { useFormContext } from "react-hook-form"

import { CustomInput } from "@/components/ui/customInput"
import CustomTooltip from "@/components/ui/tooltip"
import { ReleaseAudioFormData } from "@/types/releaseTypes"

const labelStyles =
	"text-[14px] font-bold text-inputLabel leading-[21px] tracking-[-1.5%]"

export const SocialMediaContent = () => {
	const { register } = useFormContext<ReleaseAudioFormData>()

	const socialLinks = [
		{
			name: "spotifyUrl",
			label: "Spotify",
			placeholder: "spotify.com/user/username",
			tooltip: "Enter your Spotify profile URL"
		},
		{
			name: "appleUrl",
			label: "Apple",
			placeholder: "apple.com/user/username",
			tooltip: "Enter your Apple Music profile URL"
		},
		{
			name: "youtubeUrl",
			label: "Youtube",
			placeholder: "youtube.com/channel/channelname",
			tooltip: "Enter your YouTube channel URL"
		},
		{
			name: "instagramUrl",
			label: "Instagram",
			placeholder: "instagram.com/username",
			tooltip: "Enter your Instagram profile URL"
		},
		{
			name: "tiktokUrl",
			label: "TikTok",
			placeholder: "tiktok.com/@username",
			tooltip: "Enter your TikTok profile URL"
		},
		{
			name: "xUrl",
			label: "X",
			placeholder: "x.com/username",
			tooltip: "Enter your X (Twitter) profile URL"
		}
	] as const

	return (
		<div className="grid grid-cols-2 gap-4">
			{socialLinks.map((social) => (
				<div key={social.name}>
					<label className={`flex gap-2 ${labelStyles}`}>
						{social.label}
						<CustomTooltip tooltipContent={social.tooltip} />
					</label>
					<CustomInput
						type="text"
						placeholder={social.placeholder}
						{...register(social.name)}
						classname="!border-0 !bg-[#F4F4F4] text-primary !p-3"
						rounded="rounded-xl"
					/>
				</div>
			))}
		</div>
	)
}
