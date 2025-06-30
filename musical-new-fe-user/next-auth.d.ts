import "next-auth"

declare module "next-auth" {
	interface User {
		id: string
		email: string
		name: string
		profile_type: string | number
		roles: string[]
		// ... other user properties
	}

	interface Session {
		user: User
		token: string
	}
}
