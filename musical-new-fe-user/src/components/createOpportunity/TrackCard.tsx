import { memo, useEffect, useRef, useState } from "react"
import Image, { StaticImageData } from "next/image"

import { ADD_COMMENT_ICON, MORE_OPTION, Play, TRACK_THUMBNAIL } from "@/assets"
import { formatTime } from "@/helpers"
import { getTypeColor } from "@/lib/utils"
import { Track } from "@/types"
import { IApiResponseData } from "@/types/apiResponse"
import { fetchTrack } from "@/types/createOpportunityTypes"
import { Checkbox } from "@nextui-org/react"
import { Check, Pause } from "lucide-react"

import { Waveform } from "../waveform/Waveform"

interface TrackCardProps {
	track: fetchTrack | Track | IApiResponseData
	title?: string
	artist?: string
	mediaSrc?: string | StaticImageData
	imageSrc?: string | StaticImageData
	bgClass?: string
	extension: string
	duration: number
	isSelected?: boolean
	onSelect?: () => void
	select?: boolean
	trackurl: string
	showWaveform?: boolean
	showMoreOption?: boolean
	isMuted?: boolean
	playIcon?: boolean
	isAIGenerated?: boolean
}

const TrackCard: React.FC<TrackCardProps> = ({
	playIcon = true,
	title,
	artist,
	extension,
	mediaSrc,
	imageSrc,
	duration,
	isSelected = false,
	onSelect,
	select = false,
	bgClass = "bg-hoverGray w-full px-[10px]",
	trackurl,
	showWaveform = false,
	showMoreOption = false,
	isMuted = false,
	isAIGenerated
}) => {
	const [isPlaying, setIsPlaying] = useState(false)
	const [mediaDuration, setMediaDuration] = useState<number>(0)

	const audioRef = useRef<HTMLAudioElement>(null)

	const togglePlayPause = () => {
		if (audioRef.current) {
			if (isPlaying) {
				audioRef.current.pause()
			} else {
				audioRef.current.play()
			}
			setIsPlaying(!isPlaying)
		}
	}

	useEffect(() => {
		if (isPlaying) {
			audioRef.current?.play()
		} else {
			audioRef.current?.pause()
		}

		return () => {
			if (audioRef.current) {
				audioRef.current.pause()
				// eslint-disable-next-line react-hooks/exhaustive-deps
				audioRef.current.currentTime = 0
			}
			if (isPlaying) {
				setIsPlaying(false)
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isPlaying])

	return (
		<div
			className={` py-3 items-center flex gap-4 ${bgClass} rounded-md ${isSelected ? "border border-[#1DB653]" : ""}`}
		>
			{select && (
				<div>
					<Checkbox
						icon={<Check color="green" />}
						className=""
						classNames={{ wrapper: "bg-[#fff] rounded-md " }}
						color="default"
						isSelected={isSelected}
						onChange={onSelect}
					/>
				</div>
			)}
			<div className="max-w-[100px] min-w-[100px] relative rounded-md">
				<Image
					src={imageSrc || TRACK_THUMBNAIL}
					alt="art-work"
					width={100}
					height={100}
					className="w-full h-[100px] object-cover rounded-md"
				/>
				{playIcon && (
					<span
						className="rounded-full w-8 h-8 absolute top-9 left-8 cursor-pointer z-10"
						onClick={() => togglePlayPause()}
					>
						{!isPlaying ? <Image src={Play} alt="play_icon" /> : <Pause />}
					</span>
				)}

				<div className="absolute top-0 h-full w-full right-0">
					<audio
						ref={audioRef}
						preload="metadata"
						src={trackurl}
						controls={false}
						className="w-full object-cover rounded-xl h-full"
					/>
				</div>
			</div>
			<div className="flex flex-col flex-1">
				<div className="flex flex-col justify-between items-start">
					<div>
						<span className="flex items-center gap-2">
							<div
								className={`max-w-fit capitalize rounded-lg padding px-2 py-[2px] font-medium text-[10px] text-white leading-[14px] ${getTypeColor(extension)}`}
							>
								{extension}
							</div>
							{isAIGenerated && (
								<div
									className={`max-w-fit capitalize rounded-lg padding px-2 py-[2px] font-medium text-[10px] text-white leading-[14px] bg-gradient-to-br from-gray-700 via-green-700 to-blue-700`}
								>
									AI
								</div>
							)}
						</span>
						<div className="font-semibold text-[14px] text-black leading-[20px] text-wrap max-w-[200px] truncate">
							{title}
						</div>
						<div className="text-[12px] font-normal leading-[17px]">
							{artist}
						</div>
					</div>
					{showMoreOption && (
						<div className="flex items-center gap-2">
							<Image src={ADD_COMMENT_ICON} alt="add_comment" />
							<Image src={MORE_OPTION} alt="more_option" />
						</div>
					)}
				</div>
				<div className="w-full flex items-center gap-3">
					{!showWaveform && mediaSrc && (
						<span className="flex-1">
							<Image
								src={mediaSrc}
								alt="waveform"
								width={100}
								height={100}
								className="w-full max-h-[45px]"
							/>
						</span>
					)}
					{showWaveform && (
						<Waveform
							audioUrl={trackurl}
							isPlaying={isPlaying}
							onPlay={() => setIsPlaying(true)}
							onPause={() => setIsPlaying(false)}
							onDuration={setMediaDuration}
							isMuted={isMuted}
						/>
					)}

					<span className="text-base font-normal leading-[21px] text-right">
						{trackurl && duration
							? formatTime(duration)
							: mediaDuration
								? formatTime(mediaDuration)
								: ""}
					</span>
				</div>
			</div>
		</div>
	)
}

export default memo(TrackCard)
