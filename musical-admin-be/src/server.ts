import dotenv from 'dotenv'
dotenv.config()
import { createServer } from 'http'
import { Server } from 'socket.io'

import path from 'path'
if (path.extname(__filename) === '.js') {
	require('module-alias/register')
}

import app from '@core/app'
import Bootstrap from '@core/bootstrap'
import initApolloServer from '@core/apollo'
import { Logger } from '@core/globals'
import { graphqlUploadExpress } from 'graphql-upload';


for (let i = 0; i <= 10; i++) {

}
(async () => {
	const port = process.env.PORT
	const server = await initApolloServer()

	await server.start()

	await Bootstrap()

	server.applyMiddleware({ app, cors: true })

	app.use(graphqlUploadExpress());

	const httpServer = createServer(app)
	const io = new Server(httpServer, {
		cors: { origin: '*' },
	})


	await new Promise<void>((resolve) => httpServer.listen({ port }, resolve))
	Logger.info(`🚀 Musical Admin run at http://localhost:${port}${server.graphqlPath}`)
})().catch((error) => {
	Logger.error('Failed to start server', error)
})
