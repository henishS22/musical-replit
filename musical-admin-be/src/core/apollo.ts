import { ApolloServer, ExpressContext } from 'apollo-server-express'
// import { RedisCache } from 'apollo-server-cache-redis'
import { App } from '@core/globals'
import { schemaWithMiddleware } from '@schemas/index'
import { authorize } from '@helpers/authorizer'

export default async function () {
	return new ApolloServer({
		schema: schemaWithMiddleware,
		introspection: true,
		dataSources: App.datasources,
		
		context: async ({ req, res }: ExpressContext) => {
			
			if (req?.headers?.authorization) {
				const user = await authorize(req)
				return { user }
			}
			return { req }
		},
	})
}
