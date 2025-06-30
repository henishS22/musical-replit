"use client"

import { AudioLines, Lock } from "lucide-react"

interface LockedCardProps {
	label: string
	type?: string
}

export default function LockedCard({ label, type = "Audio" }: LockedCardProps) {
	return (
		<div className="group">
			<p className="font-semibold text-[14px] leading-[150%] text-[#1A1A1A] mb-2">
				{label}
			</p>
			<div className="w-full rounded-xl bg-gradient-to-r from-[#45403E] to-[#D3C3C1] p-[22px] flex flex-col items-center justify-center gap-2">
				<Lock className="w-4 h-5 text-white" />
				<span className="flex gap-2 items-center font-semibold text-[14px] leading-[150%] text-white">
					<AudioLines className="w-4 h-4 text-white" />
					{type}
				</span>
			</div>
		</div>
	)
}
