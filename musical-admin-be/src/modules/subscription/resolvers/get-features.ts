import { UserInputError } from 'apollo-server-errors'
import { Logger } from '@core/globals'
import fs from 'fs'
import path from 'path'

interface Context {
  dataSources: any
}

export const subscriptionFeatures = {
  Query: {
    async subscriptionFeatures(
      __: any,
      _args: any,
      _context: Context
    ): Promise<any> {
      Logger.info('Inside subscriptionFeatures Resolver')
      try {
        // Path to the JSON file - using __dirname directly
        const filePath = path.join(process.cwd(), 'src/subscription-features.json')

        // Read the JSON file
        const fileData = fs.readFileSync(filePath, 'utf8')

        // Parse the JSON data
        const featuresData = JSON.parse(fileData)

        Logger.info('Successfully retrieved subscription features')
        return featuresData
      } catch (err) {
        Logger.error(`Error retrieving subscription features: ${err.message}`)
        throw new UserInputError(`Failed to retrieve subscription features: ${err.message}`)
      }
    },
  },
}