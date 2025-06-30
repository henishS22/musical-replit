"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

import { PLAY_IMAGE, PROFILE_IMAGE, VINYL_RECORD } from "@/assets"
import { AUDIO_VIDEO_MODAL } from "@/constant/modalType"

import { useDynamicStore, useModalStore } from "@/stores"

interface Track {
	artwork: string
	_id: string
	name: string
	duration: string
	user: {
		_id: string
		name: string
		profile_img: string
	}
	fileName?: string
}

export default function PreviewTrackList() {
	const { tokenTracks, addState, trackFiles } = useDynamicStore()
	const { showCustomModal } = useModalStore()
	const [activeTrack, setActiveTrack] = useState<Track | null>(null)
	const [tracks, setTracks] = useState<Track[]>([])
	// const tracks = trackFiles || tokenTracks || []

	const handleTrackClick = (track: Track) => {
		setActiveTrack(track)
		addState("trackId", track)
	}

	useEffect(() => {
		if (tracks.length > 0) {
			setActiveTrack(tracks[0])
			addState("trackId", tracks[0])
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tracks])

	useEffect(() => {
		if (tokenTracks && tokenTracks.length > 0) {
			setTracks(tokenTracks)
		} else if (trackFiles && trackFiles.length > 0) {
			setTracks(trackFiles)
		}
	}, [tokenTracks, trackFiles])

	return (
		<div className="max-w-md mx-auto bg-white overflow-hidden">
			{/* Preview Section */}
			<div>
				<div className="relative bg-purple-200 rounded-lg aspect-video flex items-center justify-center mb-2 overflow-hidden h-[200px] max-w-[268px] w-full">
					<Image
						src={activeTrack?.artwork || VINYL_RECORD}
						alt="preview"
						className="w-full z-10 object-cover max-w-[268px] h-[200px]"
						width={100}
						height={100}
					/>
					<div
						className="absolute inset-0 bg-cover bg-center blur-md"
						style={{ backgroundImage: `url(${activeTrack?.artwork})` }}
					></div>
					<Image
						src={PLAY_IMAGE}
						alt="preview"
						className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-4xl cursor-pointer z-20"
						width={50}
						height={50}
						onClick={() =>
							showCustomModal({ customModalType: AUDIO_VIDEO_MODAL })
						}
					/>
				</div>
				{activeTrack && (
					<div className="flex items-center justify-between flex-wrap gap-2">
						<div className="flex-1">
							<h3 className="font-medium text-gray-900 truncate max-w-[200px]">
								{activeTrack?.name}
							</h3>
							{activeTrack?.user?.profile_img && (
								<div className="flex items-center mt-1">
									<Image
										src={activeTrack.user.profile_img || PROFILE_IMAGE}
										alt={activeTrack.user.name}
										width={24}
										height={24}
										className="rounded-full mr-2"
									/>
									<span className="text-sm text-gray-600">
										by {activeTrack.user.name}
									</span>
								</div>
							)}
						</div>
						{activeTrack.duration && (
							<div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
								{(Number(activeTrack.duration) / 100).toFixed(2)}
							</div>
						)}
					</div>
				)}
			</div>

			{/* Track List Section */}
			<div className="border-t mt-2">
				<h3 className="px-1 py-2 text-sm font-medium text-gray-700 bg-gray-50">
					Track List
				</h3>
				<ul>
					{tracks && tracks?.length > 0
						? tracks?.map((track: Track) => (
								<li
									key={track._id}
									onClick={() => handleTrackClick(track)}
									className={`px-1 py-3 border-b last:border-b-0 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors flex-wrap gap-2 ${
										activeTrack?._id === track._id ? "bg-blue-50" : ""
									}`}
								>
									<div className="flex items-center">
										{track?.user?.profile_img && (
											<Image
												src={track?.user?.profile_img || PROFILE_IMAGE}
												alt="profile"
												width={36}
												height={36}
												className="rounded-full mr-3"
											/>
										)}
										<div>
											<h4 className="font-medium text-gray-900 truncate max-w-[150px]">
												{track?.name || track?.fileName}
											</h4>
											{track?.user?.name && (
												<p className="text-sm text-gray-600">
													by {track?.user?.name}
												</p>
											)}
										</div>
									</div>
									{track?.duration && (
										<div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
											{(Number(track?.duration) / 100).toFixed(2)}
										</div>
									)}
								</li>
							))
						: null}
				</ul>
			</div>
		</div>
	)
}
