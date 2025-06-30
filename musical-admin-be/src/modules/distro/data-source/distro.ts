import _ from 'lodash'
import DataLoader from 'dataloader'
import { UserInputError } from 'apollo-server-errors'
import { Logger } from '@core/globals'
import { MongoDataSource } from 'apollo-datasource-mongodb'
import { RoleDoc } from '@models/role'
import ProjectionField from '@helpers/projection-field'
import Pagination from '@helpers/pagination'
import QueryResolver from '@helpers/query-resolver'
import { create, checkFlag, detailById, update, detail, details } from '@helpers/mongoose'
import { DistroDoc } from '@models/distro'

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

export default class DistroDataSource extends MongoDataSource<DistroDoc> {
	public Distro: any
	public distroLoader: any
	private distroPagination: any
	constructor(Distro) {
		super(Distro)
		this.distroPagination = new Pagination(Distro)
	}

	private _distroByIdLoader = new DataLoader(async (keys: Keys[]) => {
		Logger.info('Inside _distroByIdLoader')
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



	public async getDistroList({ after, before, first, last, orderBy, filters }: GraphQLInput, info: any) {
		Logger.info('Inside getDistroList Datasource Service')
		try {
			const sort = QueryResolver.GetSortObj(orderBy)
			let filter = {}
			if (filters && Object.keys(filters).length > 0) filter = QueryResolver.GetFilterObj(filters)

			const queryArgs = _.pickBy({ after, before, first, last, filter, sort }, _.identity)

			const projection = await ProjectionField.ParseProjectionField(info, this.model.schema.obj)

			const edges: Edge[] = await this.distroPagination.GetEdges(queryArgs, projection)

			const pageInfo: PageInfo | any = await this.distroPagination.GetPageInfo(edges, queryArgs)

			return { edges, pageInfo }
		} catch (err) {
			Logger.error(`${err.message}`)
			throw new UserInputError(`${err.message}`)
		}
	}


	public async getDistroById(id: string, info: any) {
		Logger.info('Inside getDistroById Datasource Service')
		try {
			if (id) {
				const projection = await ProjectionField.ParseProjectionField(info, this.model.schema.obj)

				return this._distroByIdLoader.load({ id, projection })
			}
			return null
		} catch (err) {
			Logger.error(`${err}`)
			throw new UserInputError(`${err.message}`)
		}
	}

	public async updateStatus(id: string, data: any) {
		Logger.info('Inside updateStatus Datasource Service')
		try {
			return update(this.model, { _id: id }, data)
		} catch (err) {
			Logger.error(`${err.message}`)
			throw new UserInputError(`${err.message}`)
		}
	}


}
