import { useRef, useState } from "react"

import { Pause, Play } from "lucide-react" // Icons for buttons

export default function CustomAudioPlayer({ src }: { src: string }) {
	const [isPlaying, setIsPlaying] = useState(false)
	const audioRef = useRef<HTMLAudioElement>(null)

	const togglePlayPause = () => {
		if (audioRef.current?.paused) {
			audioRef.current?.play()
			setIsPlaying(true)
		} else {
			audioRef.current?.pause()
			setIsPlaying(false)
		}
	}

	return (
		<div className="flex items-center gap-2 ">
			<button
				type="button"
				onClick={togglePlayPause}
				className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition"
			>
				{isPlaying ? <Pause size={24} /> : <Play size={24} />}
			</button>
			<audio ref={audioRef} src={src} />
		</div>
	)
}
