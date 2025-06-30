import _ from 'lodash'
import DataLoader from 'dataloader'
import moment from 'moment'
import { UserInputError } from 'apollo-server-errors'
import { MongoDataSource } from 'apollo-datasource-mongodb'
import { App, Logger } from '@core/globals'
import { ProjectDoc } from '@models/project'
import ProjectionField from '@helpers/projection-field'
import { Keys } from '@modules/role/data-source/role'
import {
	checkFlag,
	detail,
	update,
	create,
	details,
	count,
	projectDetail,
	ProjectAndTrackDetail,
} from '@helpers/mongoose'
import { increasedPercentage } from '@helpers/dashboard'
import Pagination from '@helpers/pagination'
import QueryResolver from '@helpers/query-resolver'
import { GraphQLInput, PageResponse, PageInfo, Edge } from '@modules/role/data-source/role'

export interface periodInterface {
	yearly: {
		indicator: 'month' | 'day' | 'hour'
		index: number
	}
	monthly: {
		indicator: 'month' | 'day' | 'hour'
		index: number
	}
	weekly: {
		indicator: 'month' | 'day' | 'hour'
		index: number
	}
	daily: {
		indicator: 'month' | 'day' | 'hour'
		index: number
	}
}

export interface graphDataPayloadInterface {
	interval: 'yearly' | 'monthly' | 'weekly' | 'daily'
}

export default class ProjectDataSource extends MongoDataSource<ProjectDoc> {
	private projectPagination: any
	constructor(Project) {
		super(Project)
		this.projectPagination = new Pagination(Project)
	}


	public async getProjects(
		{ after, before, first, last, orderBy, filters }: GraphQLInput,
		info: any
	): Promise<PageResponse> {
		Logger.info('Inside getProject Datasource Service')
		try {
			const sort = QueryResolver.GetSortObj(orderBy)

			let filter = {}
			if (filters && Object.keys(filters).length > 0) filter = QueryResolver.GetFilterObj(filters)

			const queryArgs = _.pickBy({ after, before, first, last, filter, sort }, _.identity)
			const projection = await ProjectionField.ParseProjectionField(info, this.model.schema.obj)


			const edges: Edge[] = await this.projectPagination.GetEdges(queryArgs, projection)
			const pageInfo: PageInfo | any = await this.projectPagination.GetPageInfo(edges, queryArgs)

			return { edges, pageInfo }
		} catch (err) {
			Logger.error(`${err.message}`)
			throw new UserInputError(`${err.message}`)
		}
	}


	public async searchProject(keyword: string) {

		Logger.info('Inside find Datasource Service')
		try {
			const re = new RegExp(`^${keyword}.*`)

			const data = {
				name: { $regex: re, $options: 'i' },
			}

			const ProjectResult = await details(this.model, data)

			if (ProjectResult.length === 0) {
				return null
			}

			return ProjectResult.map((el) => {
				return {
					id: el._id,
					name: el.name,
					music: '28',
					minted_music: "30",
					collaborations: el.collaborators,
					createdAt: el.createdAt,
					updatedAt: el.updatedAt
				}
			})
		} catch (err) {
			Logger.error(`${err.message}`)
			throw new UserInputError(`${err.message}`)
		}
	}


	public async getDashboardProjectData() {
		Logger.info('Inside getDashboardProjectData Datasource Service')
		try {
			const accountTypeCode = 'USER'

			const startDate = moment().subtract(1, 'day').format()
			const endDate = moment().format()

			const totalCount = await count(this.model, { accountTypeCode })

			const query = {
				accountTypeCode,
				createdAt: {
					$gt: startDate,
					$lte: endDate,
				},
			}
			let countIncreased = await count(this.model, query)
			countIncreased = await increasedPercentage({ countIncreased, totalCount })

			return { totalCount, countIncreased }
		} catch (err) {
			Logger.error(`${err.message}`)
			throw new UserInputError(`${err.message}`)
		}
	}
}
