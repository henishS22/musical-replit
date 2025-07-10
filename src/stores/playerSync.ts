// stores/usePlayerSync.ts
import { create } from "zustand"

interface PlayerSyncState {
	isPlaying: boolean
	currentTime: number
	duration: number
	setPlaying: (isPlaying: boolean) => void
	setCurrentTime: (time: number) => void
	setDuration: (duration: number) => void
}

export const usePlayerSync = create<PlayerSyncState>((set) => ({
	isPlaying: false,
	currentTime: 0,
	duration: 0,
	setPlaying: (isPlaying) => set({ isPlaying }),
	setCurrentTime: (time) => set({ currentTime: time }),
	setDuration: (duration) => set({ duration })
}))
