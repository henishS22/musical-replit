import { RefObject } from "react"

import { dispatchMediaEvent } from "@/helpers"
import { MediaPlayerProps } from "@/types"
import { Button } from "@nextui-org/button"
import { Spinner } from "@nextui-org/spinner"
import { X } from "lucide-react"

interface VideoPlayerViewProps {
	videoRef: RefObject<HTMLVideoElement>
	audioRef: RefObject<HTMLAudioElement>
	isVideoMode: boolean
	isLoading: boolean
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	controls: any
	// mediaPlayer: any;
	handleClose: () => void
	mediaPlayer: MediaPlayerProps
}

function VideoPlayerView({
	videoRef,
	audioRef,
	controls,
	isLoading,
	isVideoMode,
	handleClose,
	mediaPlayer
}: VideoPlayerViewProps) {
	return (
		<>
			{isVideoMode && (
				<>
					<div className="absolute right-[30px] bottom-[83px] h-[80vh] border-t-2 rounded-t-lg max-h-[80vh] w-[371px] bg-[#181818] flex flex-col ">
						<span className="flex justify-between items-center px-4 py-3 font-bold text-sm leading-6 bg-black rounded-t-lg">
							{mediaPlayer?.title}
							<Button
								isIconOnly
								variant="light"
								className="text-white"
								size="sm"
								onPress={handleClose}
							>
								<X className="h-5 w-5" />
							</Button>
						</span>
						<div className="flex-1 overflow-hidden">
							<video
								ref={videoRef}
								src={mediaPlayer?.videoUrl}
								className="h-full w-full object-contain"
								onTimeUpdate={controls.handleTimeUpdate}
								onLoadedMetadata={controls.handleLoadedMetadata}
								onError={controls.handleError}
								// muted
								onCanPlayThrough={() => {
									dispatchMediaEvent("media-can-play-through", {
										isVideo: isVideoMode
									})
								}}
							/>
						</div>
						{isLoading && (
							<div className="absolute inset-0 flex items-center justify-center">
								<Spinner color="white" />
							</div>
						)}
					</div>
				</>
			)}

			<audio
				ref={audioRef}
				src={mediaPlayer?.audioUrl}
				muted={isVideoMode}
				onTimeUpdate={controls.handleTimeUpdate}
				onLoadedMetadata={controls.handleLoadedMetadata}
				onError={controls.handleError}
				onCanPlayThrough={() => {
					dispatchMediaEvent("media-can-play-through", {
						isVideo: isVideoMode
					})
				}}
			/>
		</>
	)
}

export default VideoPlayerView
