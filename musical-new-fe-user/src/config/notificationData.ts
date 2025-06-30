export const sampleNotifications = [
	{
		id: "1",
		user: {
			name: "Domenica",
			avatar: "https://i.pravatar.cc/150?u=domenica"
		},
		action: "Comment on",
		target: "Smiles-3D icons",
		time: "1h ago",
		read: false
	},
	{
		id: "2",
		user: {
			name: "Janice",
			avatar: "https://i.pravatar.cc/150?u=janice"
		},
		action: "likes",
		target: "Smiles - 3D icons",
		time: "2h ago",
		read: false
	},
	{
		id: "3",
		user: {
			name: "Janiya",
			avatar: "https://i.pravatar.cc/150?u=janiya"
		},
		action: "purchased",
		target: "Smiles - 3D icons",
		time: "4h ago",
		read: false
	},
	{
		id: "4",
		user: {
			name: "Danial",
			avatar: "https://i.pravatar.cc/150?u=danial"
		},
		action: "Rated ⭐️5",
		target: "Smiles-3D icons",
		time: "6h ago",
		read: true
	},
	{
		id: "5",
		user: {
			name: "Esmeralda",
			avatar: "https://i.pravatar.cc/150?u=esmeralda"
		},
		action: "commented on",
		target: "Smiles - 3D icons",
		time: "8h ago",
		read: true
	}
]

export type NotificationType = {
	id: string
	user: {
		name: string
		avatar: string
	}
	action: string
	target: string
	time: string
	read: boolean
}
