import { release } from "os";

export const EndPoints = {
	Admin: {
		GET: 2000,
		CREATE: 2001,
		UPDATE: 2002,
		DELETE: 2003,
	},
	User: {
		BAN: 3000,
		GET: 3001,
	},
	Roles: {
		GET: 4001,
		CREATE: 4002,
		UPDATE: 4003,
		DELETE: 4004,
	},
	Subscription: {
		ALL: 5004,
		GET: 5000,
		CREATE: 5001,
		UPDATE: 5002,
		DELETE: 5003,
	},
	Distro: {
		ALL: 6000,
	},
	Release: {
		ALL: 7000,
	},
}