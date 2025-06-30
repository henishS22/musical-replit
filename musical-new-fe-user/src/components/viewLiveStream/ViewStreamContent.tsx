import { FC } from "react"

import {
	CancelCallButton,
	LivestreamLayout,
	OwnCapability,
	useCallStateHooks
} from "@stream-io/video-react-sdk"

import AudioRoomContent from "../shared/AudioRoomContent"

interface ViewStreamContentProps {
	handleRequestPermission: () => Promise<void>
	handleLeaveCall: () => void
	streamType: string
}

const ViewStreamContent: FC<ViewStreamContentProps> = ({
	handleRequestPermission,
	handleLeaveCall,
	streamType
}) => {
	const { useParticipants, useHasPermissions } = useCallStateHooks()
	const participants = useParticipants()
	const hasAudioPermission = useHasPermissions(OwnCapability.SEND_AUDIO)

	return (
		<div>
			<div>
				{streamType === "livestream" ? (
					// Livestream UI
					<div className="bg-white rounded-xl shadow-lg p-6">
						<div className="flex flex-col gap-6">
							<div className="border-b pb-4">
								<h2 className="text-2xl font-bold">Live Stream</h2>
								<p className="text-gray-600">{participants.length} viewers</p>
							</div>
							<div className="rounded-lg overflow-hidden">
								<LivestreamLayout />
							</div>
							<div className="border-t pt-4">
								<div className="flex justify-center">
									<CancelCallButton onLeave={handleLeaveCall} />
								</div>
							</div>
						</div>
					</div>
				) : (
					// Audio Room UI
					<AudioRoomContent
						isHost={false}
						isLive={true}
						participants={participants}
						hasAudioPermission={hasAudioPermission}
						handleRequestPermission={handleRequestPermission}
						handleEndStream={handleLeaveCall}
					/>
				)}
			</div>
		</div>
	)
}

export default ViewStreamContent
