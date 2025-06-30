import * as fs from 'fs'
import { EndPoints } from '@core/constants/endpoint-value'
import crypto from 'crypto'

export const FileExistsSync = (FilePath) => {
	return fs.existsSync(`${FilePath}.js`) || fs.existsSync(`${FilePath}.ts`)
}

export function GenerateRandomStringOfLength(length) {
	const result = crypto.randomBytes(16).toString('base64')
	return result.slice(0, +length)
	// let result = ''
	// const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	// const charactersLength = characters.length
	// for (let i = 0; i < length; i++) {
	// 	result += characters.charAt(Math.floor(Math.random() * charactersLength))
	// }
	// return result
}

export function GenerateRandomNumberOfLength(length) {
	const min = Math.pow(10, +length - 1)
	let max = ''
	for (let i = 0; i < +length; i++) {
		max += '9'
	}
	const result = crypto.randomInt(min, +max)
	return result
	// let result = ''
	// const characters = '0123456789'
	// const charactersLength = characters.length
	// for (let i = 0; i < length; i++) {
	// 	result += characters.charAt(Math.floor(Math.random() * charactersLength))
	// }
	// return result
}

/**
 * Filtering out all the Real AclProtect values
 */
export const GetAclValues = (): number[] => {
	const readAclValues = []
	for (const property in EndPoints) {
		const element = EndPoints[property]
		readAclValues.push(...Object.values(element))
	}
	return readAclValues
}

export const PermissionsToReadable = async (permissions: number[]) => {
	permissions = permissions || [null]
	const permissionKeys = Object.keys(EndPoints)
	const permissionsMeta = {}
	for (let i = 0; i < permissionKeys.length; i++) {
		const key = permissionKeys[i]
		const element = EndPoints[key]
		const subKeys = Object.keys(element)
		permissionsMeta[key] = {}
		for (let j = 0; j < subKeys.length; j++) {
			const subKey = subKeys[j]
			if (element[subKey] && permissions.includes(element[subKey])) {
				permissionsMeta[key][subKey] = true
			} else {
				permissionsMeta[key][subKey] = false
			}
		}
	}
	return permissionsMeta
}

export const ReadableToPermissions = async (readablePermissions: any) => {
	readablePermissions = readablePermissions || null
	const readablePermissionsKeys = Object.keys(readablePermissions)
	const permissions = []

	for (let i = 0; i < readablePermissionsKeys.length; i++) {
		const key = readablePermissionsKeys[i]
		const readableElement = readablePermissions[key]
		const permissionElement = EndPoints[key]

		if (readableElement && permissionElement) {
			const subKeys = Object.keys(readableElement)
			for (let j = 0; j < subKeys.length; j++) {
				const subKey = subKeys[j]
				if (readableElement[subKey] === true && permissionElement?.[subKey]) {
					permissions.push(permissionElement[subKey])
				}
			}
		}
	}
	return permissions.filter((e) => e != undefined)
}

export const BasicAuthCredentialFetch = (options: any) => {
	const authorization = options.authorization
	if (!authorization || authorization.indexOf('Basic ') === -1) {
		return null
	}

	// verify auth credentials
	const base64Credentials = authorization.split(' ')[1]
	const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii')
	const [username, password] = credentials.split(':')
	return {
		username,
		password,
	}
}

export const getNFTTransferInput = (type, params) => {
	const { key,values,nftAddress} = params
	switch (type) {
		case 'BUY': {
			const blockchainInputs = {
				privateKey: key,
				proceedAs:
					'function buyItem(uint256 _itemId,uint256 _nftAmount,ILazyMinting.NFTVoucher calldata voucher,bytes memory signature,address buyer)',
				functionName: 'buyItem',
				values,
				contractAddress:nftAddress,
			}
			return blockchainInputs
		}
		case 'CLAIM': {
			const { key, values, nftAddress } = params
			const blockchainInputsClaim = {
				privateKey: key,
				proceedAs:
					' function claimOffer(uint256 _itemId,address _buyer,ILazyMinting.NFTVoucher calldata voucher,bytes memory signature)',
				functionName: 'claimOffer',
				values,
				contractAddress: nftAddress,
			}
			return blockchainInputsClaim
		}
		default: {
			return {}
		}
	}
}
