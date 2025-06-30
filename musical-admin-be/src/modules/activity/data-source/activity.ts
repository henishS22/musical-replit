import _ from 'lodash'
import { UserInputError } from 'apollo-server-errors'
import { MongoDataSource } from 'apollo-datasource-mongodb'
import { Logger } from '@core/globals'
import { ActivityDoc } from '@models/activity'
import ProjectionField from '@helpers/projection-field'
import Pagination from '@helpers/pagination'
import QueryResolver from '@helpers/query-resolver'
import { detail, updateArray, create } from '@helpers/mongoose'
import { GraphQLInput, PageResponse, PageInfo, Edge } from '@modules/role/data-source/role'

export default class ActivityDataSource extends MongoDataSource<ActivityDoc> {
	private activityPagination: any
	constructor(Activity) {
		super(Activity)
		this.activityPagination = new Pagination(Activity)
	}

	public async getActivities(
		{ after, before, first, last, orderBy, filters }: GraphQLInput,
		info: any
	): Promise<PageResponse> {
		Logger.info('Inside getAdmins Datasource Service')
		try {
			const sort = QueryResolver.GetSortObj(orderBy)

			let filter = {}
			if (filters && Object.keys(filters).length > 0) filter = QueryResolver.GetFilterObj(filters)

			const queryArgs = _.pickBy({ after, before, first, last, filter, sort }, _.identity)

			const projection = await ProjectionField.ParseProjectionField(info, this.model.schema.obj)

			const edges: Edge[] = await this.activityPagination.GetEdges(queryArgs, projection)

			const pageInfo: PageInfo | any = await this.activityPagination.GetPageInfo(edges, queryArgs)

			return { edges, pageInfo }
		} catch (err) {
			Logger.error(`${err.message}`)
			throw new UserInputError(`${err.message}`)
		}
	}
	public async create(payload: any): Promise<ActivityDoc> {
		Logger.info('Inside create Datasource Service')
		try {
			return create(this.model, payload)
		} catch (err) {
			Logger.error(`${err.message}`)
			throw new UserInputError(`${err.message}`)
		}
	}
	public async updateActivity(id: any, data: any) {
		Logger.info('Inside updateUser Datasource Service')
		try {
			return updateArray(this.model, id, data)
		} catch (err) {
			Logger.error(`${err.message}`)
			throw new UserInputError(`${err.message}`)
		}
	}
	public async getActivityById(id: string, type: string, info: any): Promise<ActivityDoc> {
		Logger.info('Inside getActivityById Datasource Service')
		try {
			if (id) {
				let activities
				const projection = await ProjectionField.ParseProjectionField(info, this.model.schema.obj)
				if (type === 'ROLE') {
					activities = await detail(this.model, { roleId: id }, projection)
				} else {
					activities = await detail(this.model, { userId: id }, projection)
				}
				return activities
			}

			return null
		} catch (err) {
			Logger.error(`${err}`)
			throw new UserInputError(`${err.message}`)
		}
	}
}
