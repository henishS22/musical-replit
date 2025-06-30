/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface AudioFile {
	duration: number
	durationInMinutes?: number
	file: string
	id: string
}

export interface TrackFile {
	duration: number
	file: string
	id: string
	// Add other properties as needed
}

export interface UserDetail {
	name: string
	_id: string
	// Add other properties as needed
}

interface DynamicState {
	[key: string]: unknown // Allow dynamic keys
	trackId?: TrackFile // Explicitly define the type for `trackId`
	audioFile?: AudioFile
	userDetails?: UserDetail
	videoUrl?: string
	addState: (name: string, value: unknown) => void
	removeState: (name: string) => void
	updateState: (name: string, value: unknown) => void
	getState: (name: string) => unknown
}

export const useDynamicStore = create<DynamicState | any>()(
	persist(
		(set, get) => ({
			addState: (name: string, value: unknown) =>
				set((state: any) => ({ ...state, [name]: value })),

			removeState: (name: string) =>
				set((state: any) => {
					const newState = { ...state }
					delete newState[name]
					return newState
				}, true),

			updateState: (name: string, value: unknown) => {
				const currentValue = get()[name]
				if (Array.isArray(currentValue) && Array.isArray(value)) {
					return set((state: any) => ({
						...state,
						[name]: [...currentValue, ...value]
					}))
				} else if (
					typeof currentValue === "object" &&
					typeof value === "object" &&
					currentValue !== null
				) {
					return set((state: any) => ({
						...state,
						[name]: { ...currentValue, ...value }
					}))
				} else {
					return set((state: any) => ({ ...state, [name]: value }))
				}
			},

			resetState: () => {
				// Get the current state
				const currentState = get()
				// Create a new state with only the core methods
				const resetState = {
					addState: currentState.addState,
					removeState: currentState.removeState,
					updateState: currentState.updateState,
					resetState: currentState.resetState,
					getState: currentState.getState
				}
				// Set the new state and clear localStorage
				set(resetState, true)
				localStorage.removeItem("dynamic-store")
			},
			getState: (name: string) => {
				const state = get()
				return state[name]
			}
		}),
		{
			name: "dynamic-store" // Unique name for localStorage key
		}
	)
)
