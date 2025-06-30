import _ from 'lodash'
import DataLoader from 'dataloader'
import { UserInputError } from 'apollo-server-errors'
import { Logger } from '@core/globals'
import { MongoDataSource } from 'apollo-datasource-mongodb'
import ProjectionField from '@helpers/projection-field'
import Pagination from '@helpers/pagination'
import QueryResolver from '@helpers/query-resolver'
import { create, update, details } from '@helpers/mongoose'
import { GamificationDoc } from '@models/gamificationEvent'

export interface GraphQLInput {
	first?: number
	last?: number
	after?: string
	before?: string
	orderBy: string
	filters?: any
}

export interface PageResponse {
	edges?: Edge[]
	pageInfo?: PageInfo
}

export interface PageInfo {
	startCursor: string | null
	endCursor: string | null
	hasNextPage: boolean
	hasPreviousPage: boolean
}

export interface Edge {
	cursor: string | null
	node: any
}

export interface Keys {
	id: string
	projection: string
}

export default class GamificationDataSource extends MongoDataSource<GamificationDoc> {
	public Gamification: any
	public gamificationLoader: any
	private gamificationPagination: any
	constructor(Gamification) {
		super(Gamification)
		this.gamificationPagination = new Pagination(Gamification)
	}

	public async checkIdentifier(identifier: string,) {
		Logger.info('Inside checkIdentifier Datasource Service')
		try {
			return details(this.model, { identifier: identifier })
		} catch (err) {
			Logger.error(`${err.message}`)
			throw new UserInputError(`${err.message}`)
		}
	}

	public async create(payload: any): Promise<GamificationDoc> {
		Logger.info('Inside create Datasource Service')
		try {
			return create(this.model, payload)
		} catch (err) {
			Logger.error(`${err.message}`)
			throw new UserInputError(`${err.message}`)
		}
	}

	public async getGamificationList({ after, before, first, last, orderBy, filters }: GraphQLInput, info: any) {
		Logger.info('Inside getGamificationList Datasource Service')
		try {
			const sort = QueryResolver.GetSortObj(orderBy)
			let filter = {}
			if (filters && Object.keys(filters).length > 0) filter = QueryResolver.GetFilterObj(filters)

			const queryArgs = _.pickBy({ after, before, first, last, filter, sort }, _.identity)

			const projection = await ProjectionField.ParseProjectionField(info, this.model.schema.obj)

			const edges: Edge[] = await this.gamificationPagination.GetEdges(queryArgs, projection)

			const pageInfo: PageInfo | any = await this.gamificationPagination.GetPageInfo(edges, queryArgs)

			return { edges, pageInfo }
		} catch (err) {
			Logger.error(`${err.message}`)
			throw new UserInputError(`${err.message}`)
		}
	}

	private _gamificationByIdLoader = new DataLoader(async (keys: Keys[]) => {
		Logger.info('Inside _gamificationByIdLoader')
		try {
			const ids = [...new Set(keys.map((key) => key.id))]
			const roles = await this.model
				.find({ _id: { $in: ids } })
				.select(keys[0].projection)
				.exec()

			return keys.map((key) => {
				return roles.find((role) => role._id.toString() === key.id.toString())
			})
		} catch (err) {
			Logger.error(`${err.message}`)
			throw new UserInputError(`${err.message}`)
		}
	})

	public async getGamificationById(id: string, info: any) {
		Logger.info('Inside getGamificationById Datasource Service')
		try {
			if (id) {
				const projection = await ProjectionField.ParseProjectionField(info, this.model.schema.obj)

				return this._gamificationByIdLoader.load({ id, projection })
			}
			return null
		} catch (err) {
			Logger.error(`${err}`)
			throw new UserInputError(`${err.message}`)
		}
	}

	public async update(id: string, data: any) {
		Logger.info('Inside update Datasource Service')
		try {
			return update(this.model, { _id: id }, data)
		} catch (err) {
			Logger.error(`${err.message}`)
			throw new UserInputError(`${err.message}`)
		}
	}
}