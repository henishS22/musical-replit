import { create } from "zustand"
import { persist, PersistStorage, StorageValue } from "zustand/middleware"

// Define the type for user details
export interface LoginResponse {
	id: string
	email?: string
	name?: string
	image?: string | null
	profile_type?: number
	roles?: string[]
	jwt?: string
}

export interface WalletSchema {
	addr: string // Wallet address, should be a string
	provider: string // Wallet provider, such as "Metamask", "Coinbase", etc.
}

export interface PreferredStyle {
	_id: string
	style: string
	title: {
		en: string
		es: string
	}
}

export interface Skill {
	type: {
		_id: string
		type: string
		instrument: {
			en: string
			pt: string
		}
		title: {
			en: string
			pt: string
		}
	}
	level: {
		_id: string
		title: {
			en: string
			pt: string
		}
		type: string
	}
	_id: string
}

export interface CollaborationInterest {
	_id: string
	type: string
	instrument: {
		en: string
		pt: string
	}
	title: {
		en: string
		pt: string
	}
}

export interface CollaborationSetup {
	_id: string
	style: string
	title: {
		en: string
		es: string
	}
}

interface SubscriptionUsage {
	featureKey: string
	limit: string
	unit: string
}

interface CoinflowData {
	isCanceled: boolean
	subscriptionId: string
	customerId: string
	paymentId: string
}

export interface UserSubscriptionData {
	_id: string
	userId: string
	subscriptionId: string
	billingCycle: string
	subscriptionInterval: string
	status: string
	startDate: string
	endDate: string
	usage: SubscriptionUsage[]
	coinflow: CoinflowData
	createdAt: string
	updatedAt: string
	__v: number
	subscriptionDetails: {
		name: string
		description: string
		price: number
		interval: string
		type: string
		subscriptionId: string
		planCode: string
		features: {
			featureKey: string
			limit: string
			unit: string
			available: boolean
		}[]
	}
}

export interface UserInfoResponse {
	_id: string
	name: string
	email: string
	emailVerified: boolean
	birthday: string | null
	genre: number
	profile_type: number
	profile_img: string | null
	preferredStyles: PreferredStyle[]
	wallets: WalletSchema[]
	roles: string[]
	skills: Skill[]
	createdAt: string
	updatedAt: string
	__v: number
	country: string
	state: string
	city: string
	spotify: string
	apple_music: string
	youtube: string
	instagram: string
	tiktok: string
	twitter: string
	descr: string
	username: string
	clb_interest: CollaborationInterest[]
	clb_setup: CollaborationSetup[]
	clb_availability: string
	userSubscription: UserSubscriptionData[]
	cover_img: string | null
	isDistroApproved?: boolean
	firstTimeLogin?: boolean
}

export interface SubscriptionFeatureAvailability {
	featureKey: string
	description: string
	available: boolean
}

// Define the type for the store
interface UserStore {
	user: LoginResponse | null
	loginData: (userDetails: LoginResponse) => void
	userInfo: (userDetails: UserInfoResponse) => void
	subscriptionFeatureAvailability: (
		featureAvailability: SubscriptionFeatureAvailability[]
	) => void
	subscriptionFeatures: SubscriptionFeatureAvailability[] | null
	userData: UserInfoResponse | null
	logout: () => void
	isFirstLogin: boolean | null
	setIsFirstLogin: (isFirstLogin: boolean) => void
}

// Custom localStorage handler to ensure proper JSON parsing
const customStorage: PersistStorage<UserStore> = {
	getItem: (key) => {
		const storedValue = localStorage.getItem(key)
		return storedValue
			? (JSON.parse(storedValue) as StorageValue<UserStore>)
			: null
	},
	setItem: (key, value) => {
		localStorage.setItem(key, JSON.stringify(value))
	},
	removeItem: (key) => {
		localStorage.removeItem(key)
	}
}

const useUserStore = create<UserStore>()(
	persist(
		(set) => ({
			user: null,
			userData: null,
			subscriptionFeatures: null,
			isFirstLogin: null,
			loginData: (userDetails: LoginResponse) => set({ user: userDetails }),
			userInfo: (userDetails: UserInfoResponse) =>
				set({ userData: userDetails }),
			subscriptionFeatureAvailability: (
				featureAvailability: SubscriptionFeatureAvailability[]
			) => set({ subscriptionFeatures: featureAvailability }),
			logout: () =>
				set({
					user: null,
					userData: null,
					subscriptionFeatures: null,
					isFirstLogin: null
				}),
			setIsFirstLogin: (isFirstLogin: boolean) => set({ isFirstLogin })
		}),
		{
			name: "user-storage",
			storage: customStorage
		}
	)
)

export default useUserStore
