import _ from 'lodash'
import { projects } from './get-all'
import { searchProjects } from "./search"


export const projectResolvers = _.merge(
	projects,
	searchProjects
)
