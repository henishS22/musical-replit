import _ from 'lodash'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { resolve } from 'path'
import { generateKeyPairSync } from 'crypto'
import { App, Logger } from '@core/globals'

interface JWTPayload extends JwtPayload {
	_id: string
	accountTypeCode: number
}

class JWTHelper {
	private JWT_SECRET = App.Config.JWT_SECRET
	private JWT_EXPIRY = Number(App.Config.JWT_EXPIRY)
	private keyDir = resolve(`${__dirname}/../../keys`)
	private publicKeyPath = resolve(`${this.keyDir}/rsa.pub`)
	private privateKeyPath = resolve(`${this.keyDir}/rsa`)

	/**
	 * Get token user
	 * @param {string} payload
	 * @returns
	 */
	public async GetUser(payload: { token: string }) {
		const { token } = payload
		const verification: string | JwtPayload = this.VerifyToken(token)
		if (verification) {
			const user = await App.Models.Admin.findOne({
				_id: verification.sub,
				isActive: true,
				isDeleted: false,
			}).populate({ path: 'roleId', select: 'permissions' })

			if (user?.permissions) {
				user.permissions = _.union(user.permissions || [], user.roleId['permissions'] || [])
			}

			delete user?.password
			return user
		}
		return null
	}

	/**
	 * Verify the token with rsa public key.
	 * @param {string} token
	 * @returns string | JwtPayload
	 */
	VerifyToken(token: string) {
		try {
			const publicKey = readFileSync(this.publicKeyPath)
			return jwt.verify(token, publicKey, {
				algorithms: ['RS256'],
			})
		} catch (error) {
			return error
		}
	}

	/**
	 * Create a signed JWT with the rsa private key.
	 * @param {*} payload
	 * @returns token
	 */
	public GenerateToken(payload: JWTPayload): string {
		const privateKey = readFileSync(this.privateKeyPath)

		return jwt.sign(
			payload,
			{ key: privateKey.toString(), passphrase: this.JWT_SECRET },
			{
				algorithm: 'RS256',
				expiresIn: this.JWT_EXPIRY,
				subject: payload._id,
			}
		)
	}

	/**
	 * Generates RSA Key Pairs for JWT authentication
	 * It will generate the keys only if the keys are not present.
	 */
	public GenerateKeys(): void {
		try {
			const keyDir = this.keyDir
			const publicKeyPath = this.publicKeyPath
			const privateKeyPath = this.privateKeyPath

			const JWT_SECRET = this.JWT_SECRET

			// Throw error if JWT_SECRET is not set
			if (!JWT_SECRET) {
				throw new Error('JWT_SECRET is not defined.')
			}

			// Check if config/keys exists or not
			if (!existsSync(keyDir)) {
				mkdirSync(keyDir)
			}

			// Check if PUBLIC and PRIVATE KEY exists else generate new
			if (!existsSync(publicKeyPath) && !existsSync(privateKeyPath)) {
				const result = generateKeyPairSync('rsa', {
					modulusLength: 4096,
					publicKeyEncoding: {
						type: 'spki',
						format: 'pem',
					},
					privateKeyEncoding: {
						type: 'pkcs8',
						format: 'pem',
						cipher: 'aes-256-cbc',
						passphrase: JWT_SECRET,
					},
				})

				const { publicKey, privateKey } = result
				writeFileSync(`${keyDir}/rsa.pub`, publicKey, { flag: 'wx' })
				writeFileSync(`${keyDir}/rsa`, privateKey, { flag: 'wx' })
				Logger.warn('New public and private key generated.')
			}
		} catch (error) {
			Logger.error(`Key generation failed: ${error.message}`)
			throw new Error(`Key generation failed: ${error.message}`)
		}
	}
}

// All Done
export default new JWTHelper()
