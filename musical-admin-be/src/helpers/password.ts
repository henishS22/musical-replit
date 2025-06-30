import bcrypt from 'bcrypt'
import { Logger } from '@core/globals'

export class Password {
	// Using process.env because It's using in static methods which are gonna be loaded before the application
	static SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS)

	/**
	 * @param password
	 * @returns hash
	 */
	static async toHash(password: string): Promise<string> {
		Logger.info('Inside toHash Function')
		const hash = await bcrypt.hash(password, this.SALT_ROUNDS)
		if (!hash) throw new Error('Error hashing password')

		return hash
	}

	/**
	 * @param storedPassword
	 * @param supliedPassword
	 * @returns boolean
	 */
	static async compare(
		storedPassword: string,
		supliedPassword: string
	): Promise<boolean> {
		Logger.info('Inside compare Function')
		return await bcrypt.compare(storedPassword, supliedPassword)
	}
}
