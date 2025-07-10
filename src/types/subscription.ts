export interface Feature {
	featureKey: string
	description: string
	available: boolean
	limit?: string
	unit?: string
	_id: string
}

export interface SubscriptionPlan {
	_id: string
	name: string
	description: string
	price: number
	interval: string
	features: Feature[]
	planCode: string
	coinflowPlanId: string
	currency: string
	status: string
	type: string
	createdAt: string
	updatedAt: string
}

export interface Addon {
	_id: string
	name: string
	description: string
	price: number
	interval: string
	features: Feature[]
	planCode: string
	type: string
	coinflowPlanId?: string
	currency?: string
	status?: string
}

export interface GroupedAddon {
	name: string
	description: string
	monthly?: Addon
	yearly?: Addon
	lifetime?: Addon
}

export interface SubscriptionCardProps {
	plan: SubscriptionPlan
	isSelected: boolean
	onSelect: () => void
	offerDesc: string
}

export interface ALaCarteTableProps {
	addonsData: Addon[]
	selectedAddons: string[]
}
