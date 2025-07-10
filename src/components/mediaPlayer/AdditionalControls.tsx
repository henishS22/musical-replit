import { memo } from "react"

import { MediaControls, MediaPlayerProps, Track } from "@/types"
import { PlaybackSpeed } from "@/types/media"
import { Button } from "@nextui-org/button"
import {
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger
} from "@nextui-org/dropdown"
import { Slider } from "@nextui-org/slider"
import { Share2, Video, VideoOff, Volume2, VolumeX, X } from "lucide-react"

interface AdditionalControlsProps {
	mediaPlayer: MediaPlayerProps | null
	handleShare: (item: Track) => void
	handleClose: () => void
	volume: number
	speed: number
	isVideoMode: boolean
	controls: MediaControls
}

function AdditionalControls({
	mediaPlayer,
	handleShare,
	handleClose,
	volume,
	speed,
	isVideoMode,
	controls
}: AdditionalControlsProps) {
	const speedOptions: PlaybackSpeed[] = [0.5, 0.75, 1, 1.25, 1.5, 2]

	return (
		<div className="flex items-center gap-2">
			{/* Volume Control */}
			<div className="flex items-center gap-2">
				<Button
					isIconOnly
					variant="light"
					className="text-white"
					size="sm"
					onPress={() => controls.updateVolume(volume === 0 ? 1 : 0)}
				>
					{volume === 0 ? (
						<VolumeX className="h-5 w-5" />
					) : (
						<Volume2 className="h-5 w-5" />
					)}
				</Button>
				<Slider
					size="sm"
					value={volume}
					onChange={(value) => controls.updateVolume(value as number)}
					className="w-24"
					maxValue={1}
					step={0.1}
					color="success"
				/>
			</div>

			{/* Playback Speed */}
			<Dropdown>
				<DropdownTrigger>
					<Button variant="light" className="text-white" size="sm">
						{speed}x
					</Button>
				</DropdownTrigger>
				<DropdownMenu
					aria-label="Playback speed"
					onAction={(key) => controls.updateSpeed(Number(key) as PlaybackSpeed)}
				>
					{speedOptions.map((speed) => (
						<DropdownItem key={speed}>{speed}x</DropdownItem>
					))}
				</DropdownMenu>
			</Dropdown>

			{/* Video Toggle */}
			{mediaPlayer?.extension === "video" && (
				<Button
					isIconOnly
					variant="light"
					className="text-white"
					size="sm"
					onPress={controls.toggleVideoMode}
				>
					{isVideoMode ? (
						<Video className="h-5 w-5" />
					) : (
						<VideoOff className="h-5 w-5" />
					)}
				</Button>
			)}
			<Button
				isIconOnly
				variant="light"
				className="text-white"
				size="sm"
				onPress={() => handleShare(mediaPlayer?.item as Track)}
			>
				<Share2 className="h-5 w-5" />
			</Button>
			<Button
				isIconOnly
				variant="light"
				className="text-white"
				size="sm"
				onPress={handleClose}
			>
				<X className="h-5 w-5" />
			</Button>
		</div>
	)
}

export default memo(AdditionalControls)
