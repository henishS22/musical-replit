"use client"

import Image from "next/image"

import { MUSIC_ICON } from "@/assets"

export function MusicPlayer() {
	return (
		<div>
			<label className="block text-sm font-medium text-textPrimary mb-1">
				Music
			</label>
			<div className="flex items-center h-[48px] p-3 border-2 border-customGray rounded-lg bg-white">
				<Image src={MUSIC_ICON} alt="Music" className="w-5 h-5" />
				<p className="text-sm ml-4">Untitled.mp3</p>
				<div className="flex-1 flex items-center"></div>
				<span className="text-medium text-textGray">4:42</span>
			</div>
		</div>
	)
}
