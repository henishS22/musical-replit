import React from "react"

interface LoaderProps {
	isOpen: boolean
	type?: "waveform" | "circular"
}

const Loader: React.FC<LoaderProps> = ({ isOpen, type = "waveform" }) => {
	if (!isOpen) return null

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<div className="flex flex-col items-center gap-6 p-8">
				{type === "waveform" ? (
					<div className="flex items-center gap-2 h-[200px]">
						<div className="w-4 h-[40%] bg-[#008BFF] rounded-full animate-waveform [animation-delay:0s] scale-y-[0.4]" />
						<div className="w-4 h-[60%] bg-[#008BFF] rounded-full animate-waveform [animation-delay:0.1s] scale-y-[0.7]" />
						<div className="w-4 h-[80%] bg-[#008BFF] rounded-full animate-waveform [animation-delay:0.2s]" />
						<div className="w-4 h-full bg-[#008BFF] rounded-full animate-waveform [animation-delay:0.3s]" />
						<div className="w-4 h-[80%] bg-[#008BFF] rounded-full animate-waveform [animation-delay:0.4s]" />
						<div className="w-4 h-[60%] bg-[#008BFF] rounded-full animate-waveform [animation-delay:0.5s] scale-y-[0.7]" />
						<div className="w-4 h-[40%] bg-[#008BFF] rounded-full animate-waveform [animation-delay:0.6s] scale-y-[0.4]" />
					</div>
				) : (
					<div className="relative w-[400px] h-[400px]">
						{/* Background circle */}
						<svg className="w-full h-full" viewBox="0 0 100 100">
							{/* Gray background circle */}
							<circle
								cx="50"
								cy="50"
								r="45"
								fill="none"
								stroke="#D6E8EE"
								strokeWidth="2"
							/>
							{/* Animated teal segment */}
							<circle
								cx="50"
								cy="50"
								r="45"
								fill="none"
								stroke="#009AAA"
								strokeWidth="2"
								strokeDasharray="10 283" // 283 is approximately 2πr
								className="animate-spin-slow origin-center"
							/>
						</svg>
					</div>
				)}
			</div>
		</div>
	)
}

export default Loader
