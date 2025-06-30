import { Logger } from '@core/logger'
import { UserInputError } from 'apollo-server-errors'
import { Role } from '@core/constants/roles'
import { ProjectDoc } from '@models/project'




export const projects = {
	Query: {
		async projects(__: any, args: any, { dataSources: { Project } }, info: any) {
			Logger.info('Inside project Resolver')
			try {
				args.filters = { ...args.filters }
				const projects = await Project.getProjects(args, info)

				if (!projects) throw new Error('No Project found')
				
				return { edges: projects.edges, pageInfo: projects.pageInfo }
			} catch (err) {
				Logger.error(`${err}`)
				throw new UserInputError(`${err.message}`)
			}
		}
	},
}
