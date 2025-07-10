enum LivestreamType {
	AUDIO_ROOM = "audio_room",
	VIDEO_ROOM = "video_room"
}

export const livestreamOptions = [
	{ key: LivestreamType.AUDIO_ROOM, label: "Audio Room" },
	{ key: LivestreamType.VIDEO_ROOM, label: "Video Room" }
]
