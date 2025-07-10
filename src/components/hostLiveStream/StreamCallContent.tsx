import { FC } from "react"

import { Button } from "@nextui-org/react"
import {
	CancelCallButton,
	LivestreamLayout,
	PermissionRequestEvent,
	ScreenShareButton,
	ToggleAudioPublishingButton,
	ToggleVideoPublishingButton,
	useCallStateHooks
} from "@stream-io/video-react-sdk"

import AudioRoomContent from "../shared/AudioRoomContent"

interface StreamCallContentProps {
	isLive: boolean
	handleGoLive: () => Promise<void>
	handleEndStream: () => Promise<void>
	permissionRequests: PermissionRequestEvent[]
	handlePermissionRequest: (
		request: PermissionRequestEvent,
		accept: boolean
	) => Promise<void>
	streamType: string
}

const StreamCallContent: FC<StreamCallContentProps> = ({
	isLive,
	handleGoLive,
	handleEndStream,
	permissionRequests,
	handlePermissionRequest,
	streamType
}) => {
	const { useParticipants } = useCallStateHooks()
	const participants = useParticipants()

	return (
		<div className="w-full flex flex-col gap-4">
			{streamType === "livestream" ? (
				// Livestream UI
				<div className="bg-white rounded-xl shadow-lg p-6">
					<div className="flex flex-col gap-6">
						{/* Stream Header */}
						<div className="border-b pb-4">
							<h2 className="text-2xl font-bold">Live Stream</h2>
							<p className="text-gray-600">{participants.length} viewers</p>
						</div>

						{/* Video Layout */}
						<div className="rounded-lg overflow-auto w-full max-h-[700px] scrollbar">
							<LivestreamLayout />
						</div>

						{/* Stream Controls */}
						<div className="border-t pt-4">
							<div className="flex justify-center items-center gap-2">
								{isLive ? (
									<>
										<ToggleAudioPublishingButton />
										<ToggleVideoPublishingButton />
										<ScreenShareButton />
										<CancelCallButton onLeave={handleEndStream} />
									</>
								) : (
									<Button
										onPress={handleGoLive}
										className="bg-[linear-gradient(176deg,#1DB653_3.76%,#0E5828_96.59%)] text-white"
									>
										Go Live
									</Button>
								)}
							</div>
						</div>
					</div>
				</div>
			) : (
				// Audio Room UI
				<AudioRoomContent
					isHost={true}
					isLive={isLive}
					participants={participants}
					handleGoLive={handleGoLive}
					handleEndStream={handleEndStream}
					permissionRequests={permissionRequests}
					handlePermissionRequest={handlePermissionRequest}
				/>
			)}
		</div>
	)
}

export default StreamCallContent
