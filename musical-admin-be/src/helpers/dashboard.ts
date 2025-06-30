import { Logger } from '@core/globals'
import { UserInputError } from 'apollo-server-errors'

export const increasedPercentage = async (data: any) => {
	Logger.info('Inside getDashboardUserData Datasource Service')
	try {
		const { countIncreased, totalCount } = data

		const difference = Math.abs(countIncreased - totalCount)
		if (difference <= 0) return 0

		const increasedPercentage = (countIncreased / difference) * 100

		return increasedPercentage || 0
	} catch (error) {
		Logger.error(error)
		throw new UserInputError(`${error.message}`)
	}
}
