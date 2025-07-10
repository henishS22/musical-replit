import { create } from "zustand"
import { persist } from "zustand/middleware"

interface Message {
	id: string
	content: string
	type: "user" | "bot"
	timestamp: string
}

interface AIChatState {
	messages: Message[]
	lyrics: Message[]
	addMessage: (message: Message) => void
	addLyrics: (lyrics: Message) => void
	clearMessages: () => void
	clearLyrics: () => void
}

export const useAIChatStore = create<AIChatState>()(
	persist(
		(set) => ({
			messages: [],
			lyrics: [],
			addMessage: (message) =>
				set((state) => ({
					messages: [...state.messages, message]
				})),
			addLyrics: (lyrics) =>
				set((state) => ({
					lyrics: [...state.lyrics, lyrics]
				})),
			clearMessages: () => set({ messages: [] }),
			clearLyrics: () => set({ lyrics: [] })
		}),
		{
			name: "AIChat" // name of the item in localStorage
		}
	)
)
