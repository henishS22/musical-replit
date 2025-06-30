import { FC } from "react"

import { Button, Image } from "@nextui-org/react"
import {
	CancelCallButton,
	ParticipantsAudio,
	PermissionRequestEvent,
	SfuModels,
	StreamVideoParticipant,
	ToggleAudioPublishingButton
} from "@stream-io/video-react-sdk"

interface AudioRoomContentProps {
	isHost: boolean
	isLive: boolean
	participants: StreamVideoParticipant[]
	hasAudioPermission?: boolean
	handleGoLive?: () => Promise<void>
	handleEndStream?: () => void
	handleRequestPermission?: () => Promise<void>
	permissionRequests?: PermissionRequestEvent[]
	handlePermissionRequest?: (
		request: PermissionRequestEvent,
		accept: boolean
	) => Promise<void>
}

const AudioRoomContent: FC<AudioRoomContentProps> = ({
	isHost,
	isLive,
	participants,
	hasAudioPermission,
	handleGoLive,
	handleEndStream,
	handleRequestPermission,
	permissionRequests = [],
	handlePermissionRequest
}) => {
	const hasAudio = (p: StreamVideoParticipant) =>
		p.publishedTracks.includes(SfuModels.TrackType.AUDIO)

	const speakers = participants.filter(hasAudio)
	const listeners = participants.filter((p) => !hasAudio(p))

	return (
		<div className="bg-white rounded-xl p-6">
			<div className="flex flex-col gap-6">
				{/* Room Header */}
				<div className="border-b pb-4">
					<h2 className="text-2xl font-bold">Audio Room</h2>
					<p className="text-gray-600">{participants.length} participants</p>
					{isHost && (
						<div className="mt-2">
							<Button
								onPress={() =>
									isLive ? handleEndStream?.() : handleGoLive?.()
								}
								className={`${isLive ? "bg-red-500" : "bg-[linear-gradient(176deg,#1DB653_3.76%,#0E5828_96.59%)]"} text-white`}
							>
								{isLive ? "End Room" : "Go Live"}
							</Button>
						</div>
					)}
				</div>

				{isLive && (
					<>
						{/* Speakers Section */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold">
								Speakers ({speakers.length})
							</h3>
							<div className="flex flex-wrap gap-3">
								{speakers.map((speaker) => (
									<div key={speaker.userId} className="text-center">
										<div className="w-16 h-16 mx-auto rounded-full bg-gray-200 mb-2">
											{speaker.image && (
												<Image
													src={speaker.image}
													className="w-full h-full rounded-full object-cover"
													alt={speaker.name}
												/>
											)}
										</div>
										<p className="text-sm font-medium truncate">
											{speaker.name}
										</p>
									</div>
								))}
							</div>
						</div>

						{/* Listeners Section */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold">
								Listeners ({listeners.length})
							</h3>
							<div className="flex flex-wrap gap-3">
								{listeners.map((listener) => (
									<div key={listener.userId} className="text-center">
										<div className="w-12 h-12 mx-auto rounded-full bg-gray-200 mb-1">
											{listener.image && (
												<Image
													src={listener.image}
													className="w-full h-full rounded-full object-cover"
													alt={listener.name}
												/>
											)}
										</div>
										<p className="text-xs truncate">{listener.name}</p>
									</div>
								))}
							</div>
						</div>

						{/* Speaker Requests Section - Only for Host */}
						{isHost && (
							<div className="space-y-4">
								<h3 className="text-lg font-semibold flex items-center gap-2">
									<span>Speaker Requests</span>
									{permissionRequests.length > 0 && (
										<span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
											{permissionRequests.length}
										</span>
									)}
								</h3>
								<div className="space-y-2">
									{permissionRequests.map((request) => (
										<div
											key={request.user.id}
											className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
										>
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 rounded-full overflow-hidden">
													<Image
														src={request.user.image || "/default-avatar.png"}
														alt={request.user.name || "User"}
														width={40}
														height={40}
														className="object-cover w-full h-full"
													/>
												</div>
												<div className="flex flex-col">
													<span className="font-semibold text-sm">
														{request.user.name}
													</span>
													<span className="text-xs text-gray-500">
														Requesting to speak
													</span>
												</div>
											</div>
											<div className="flex gap-2">
												<Button
													size="sm"
													onPress={() =>
														handlePermissionRequest?.(request, true)
													}
													className="bg-green-500 text-white"
												>
													Accept
												</Button>
												<Button
													size="sm"
													onPress={() =>
														handlePermissionRequest?.(request, false)
													}
													className="bg-red-500 text-white"
												>
													Decline
												</Button>
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Room Controls */}
						<div className="border-t pt-4">
							<ParticipantsAudio participants={participants} />
							<div
								className={`flex items-center mt-4 ${!hasAudioPermission ? "justify-between" : "justify-end"}`}
							>
								{!isHost && !hasAudioPermission && (
									<Button
										size="sm"
										variant="flat"
										onPress={handleRequestPermission}
									>
										✋ Request to Speak
									</Button>
								)}
								<div className="flex gap-4">
									<ToggleAudioPublishingButton />
									<CancelCallButton onLeave={handleEndStream} />
								</div>
							</div>
						</div>
					</>
				)}

				{/* Backstage UI for Host */}
				{isHost && !isLive && (
					<div className="text-center py-8">
						<h3 className="text-xl font-semibold mb-2">Backstage</h3>
						<p className="text-gray-600 mb-4">
							Setup your audio and go live when you&apos;re ready
						</p>
						<div className="space-y-4 flex justify-center">
							<ParticipantsAudio participants={participants} />
							<div className="max-w-fit">
								<ToggleAudioPublishingButton />
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

export default AudioRoomContent
