import { useMemo } from "react"

import { useTranslationContext } from "stream-chat-react"

import "./customChannelList.css"

import Image from "next/image"

import { PROFILE_IMAGE } from "@/assets"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomChannelPreview = (props: any) => {
	const {
		channel,
		activeChannel,
		displayImage,
		displayTitle,
		latestMessagePreview,
		setActiveChannel
	} = props
	const latestMessageAt = channel.state.last_message_at
	const isSelected = channel.id === activeChannel?.id
	const { userLanguage } = useTranslationContext()

	const timestamp = useMemo(() => {
		if (!latestMessageAt) {
			return ""
		}
		const formatter = new Intl.DateTimeFormat(userLanguage, {
			timeStyle: "short"
		})
		return formatter.format(latestMessageAt)
	}, [latestMessageAt, userLanguage])

	const handleClick = () => {
		setActiveChannel?.(channel)
	}

	return (
		<button
			className={`channel-preview ${isSelected ? "channel-preview_selected" : ""}`}
			disabled={isSelected}
			onClick={handleClick}
		>
			<Image
				className="channel-preview__avatar w-[56px] h-[56px] rounded-full"
				src={displayImage || PROFILE_IMAGE}
				alt="channel-preview"
				width={56}
				height={56}
			/>
			<div className="channel-preview__main">
				<div className="channel-preview__header">
					<div className="channel-preview__title truncate flex-1">
						{displayTitle}
					</div>
					<time
						dateTime={latestMessageAt?.toISOString()}
						className="channel-preview__timestamp whitespace-nowrap ml-2"
					>
						{timestamp}
					</time>
				</div>
				<div className="channel-preview__message">{latestMessagePreview}</div>
			</div>
		</button>
	)
}

export default CustomChannelPreview
