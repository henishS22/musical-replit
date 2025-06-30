import { Logger } from '@core/globals'
import { FileExistsSync } from './utils'

export interface ConfigInterface {
	PORT: number
	ENVIRONMENT: string

	DB_CONNECTION_STRING: string

	SALT_ROUNDS: number

	JWT_SECRET: string
	JWT_EXPIRY: string

	TWILIO: {
		SID: string
		TOKEN: string
		FROM: string
	}

	BACKEND_HOSTED_URL: string

	TOKEN_ADDRESS: string
	MARKET_ADDRESS: string
	NFT_ADDRESS: string
	RATE_LIMITER_TIME_IN_SEC: string
	RATE_LIMITER_REQUEST_COUNT: string

	BINANCE_TOKEN_ADDRESS: string
	BINANCE_MARKET_ADDRESS: string
	BINANCE_NFT_ADDRESS: string

	NOWPAYMENTS: {
		API_KEY: string
		BASE_URL: string
		WEBHOOK_URL: string
		WEBHOOK_SECRET: string
	}
	NFT_DETAILS_BASE_URL: string
	ADMIN_PRIVATE_KEY: string
	TOKEN_PRICE_IN_USD: number
	ADMIN_BLUE_ADDRESS: string

	BICONOMY: {
		POLYGON_APPID: string
		BINANCE_APPID: string
		POLYGON_PROJECTID: string
		BINANCE_PROJECTID: string
		METATXN_URL: string
	}
	POLYGON_RPC_URL: string
	BINANCE_RPC_URL: string

	POLYGON_CHAINID: string
	BINANCE_CHAINID: string

	REACT_APP_PINATA_API_KEY: string
	REACT_APP_PINATA_API_KEY_SECRET: string
	PINATA_JWT_KEY: string

	COINFLOW_API_KEY: string
	COINFLOW_BASE_URL: string
	MAIL_JET: {
		USER: string
		PASSWORD: string
		FROM: string
	},
}

export default (): ConfigInterface => {
	Logger.info('Inside ConfigInterface')
	const { NODE_ENV = 'development' } = process.env
	const environment = NODE_ENV?.toLowerCase()
	const environmentFileLocation = `${__dirname}/../environments`
	const environmentFilePath = `${environmentFileLocation}/${environment}`

	if (FileExistsSync(environmentFilePath)) {
		/* eslint-disable */
		// prettier-ignore
		const configuration: ConfigInterface = (require(environmentFilePath).default)()
		/* eslint-enable */
		return configuration
	} else {
		Logger.error(`Missing environment file for NODE_ENV=${environment}.`)
		throw Error(`Missing environment file for NODE_ENV=${environment}.`)
	}
}
