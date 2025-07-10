import { memo } from "react"

import { dispatchMediaEvent, formatTime } from "@/helpers"
import { MediaControls, MediaPlayerProps } from "@/types"
import { Button } from "@nextui-org/button"
import { Progress } from "@nextui-org/progress"
import { FastForward, Pause, Play, Rewind } from "lucide-react"

interface AudioControlsProps {
	mediaPlayer: MediaPlayerProps
	isPlaying: boolean
	currentTime: number
	duration: number
	isLoading: boolean
	controls: MediaControls
	handlePlayPause: () => void
}

function AudioControls({
	mediaPlayer,
	isPlaying,
	currentTime,
	duration,
	controls,
	isLoading,
	handlePlayPause
}: AudioControlsProps) {
	// update seek handlers
	const handleSeekBackward = () => {
		const seekAmount = duration < 10 ? 1 : 5
		const newTime = Math.max(0, currentTime - seekAmount)
		controls.seek(newTime)
		dispatchMediaEvent("media-seek-backward", {
			previousTime: currentTime,
			newTime,
			seekAmount
		})
	}

	const handleSeekForward = () => {
		const seekAmount = duration < 10 ? 1 : 5
		const newTime = Math.min(duration, currentTime + seekAmount)
		controls.seek(newTime)
		dispatchMediaEvent("media-seek-forward", {
			previousTime: currentTime,
			newTime,
			seekAmount
		})
	}

	const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
		const rect = e.currentTarget.getBoundingClientRect()
		const pos = (e.clientX - rect.left) / rect.width

		const newTime = pos * mediaPlayer?.duration
		controls.seek(newTime)

		document.dispatchEvent(
			new CustomEvent("media-player-seek", {
				detail: {
					trackId: mediaPlayer?.item?._id,
					position: newTime
				}
			})
		)
	}

	return (
		<div className="flex flex-1 flex-col items-center gap-1">
			<div className="flex items-center gap-4">
				<Button
					isIconOnly
					variant="light"
					className="text-white"
					size="sm"
					onPress={handleSeekBackward}
				>
					<Rewind className="h-5 w-5" />
				</Button>
				<Button
					isIconOnly
					variant="light"
					className="text-white"
					size="sm"
					onPress={handlePlayPause}
					disabled={isLoading}
				>
					{isPlaying ? (
						<Pause className="h-5 w-5" />
					) : (
						<Play className="h-5 w-5" />
					)}
				</Button>
				<Button
					isIconOnly
					variant="light"
					className="text-white"
					size="sm"
					onPress={handleSeekForward}
				>
					<FastForward className="h-5 w-5" />
				</Button>
			</div>
			<div className="flex w-full items-center gap-2">
				<span className="text-xs text-gray-400">{formatTime(currentTime)}</span>
				<Progress
					aria-label="Music progress"
					value={(currentTime / mediaPlayer?.duration) * 100}
					className="flex-1 cursor-pointer"
					size="sm"
					color="default"
					onClick={handleProgressClick}
				/>
				<span className="text-xs text-gray-400">
					{formatTime(mediaPlayer?.duration)}
				</span>
			</div>
		</div>
	)
}

export default memo(AudioControls)
