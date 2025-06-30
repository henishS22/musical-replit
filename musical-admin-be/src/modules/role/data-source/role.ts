import _ from 'lodash'
import DataLoader from 'dataloader'
import { UserInputError } from 'apollo-server-errors'
import { Logger } from '@core/globals'
import { MongoDataSource } from 'apollo-datasource-mongodb'
import { RoleDoc } from '@models/role'
import ProjectionField from '@helpers/projection-field'
import Pagination from '@helpers/pagination'
import QueryResolver from '@helpers/query-resolver'
import { create, checkFlag, detailById, update, detail } from '@helpers/mongoose'

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

export default class RoleDataSource extends MongoDataSource<RoleDoc> {
	public Role: any
	public roleLoader: any
	private rolePagination: any
	constructor(Role) {
		super(Role)
		this.rolePagination = new Pagination(Role)
	}

	private _roleByIdLoader = new DataLoader(async (keys: Keys[]) => {
		Logger.info('Inside _roleByIdLoader')
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

	public async getRoles({ after, before, first, last, orderBy, filters }: GraphQLInput, info: any) {
		Logger.info('Inside getRoles Datasource Service')
		try {
			const sort = QueryResolver.GetSortObj(orderBy)
			let filter = {}
			if (filters && Object.keys(filters).length > 0) filter = QueryResolver.GetFilterObj(filters)

			const queryArgs = _.pickBy({ after, before, first, last, filter, sort }, _.identity)

			const projection = await ProjectionField.ParseProjectionField(info, this.model.schema.obj)

			const edges: Edge[] = await this.rolePagination.GetEdges(queryArgs, projection)

			const pageInfo: PageInfo | any = await this.rolePagination.GetPageInfo(edges, queryArgs)

			return { edges, pageInfo }
		} catch (err) {
			Logger.error(`${err.message}`)
			throw new UserInputError(`${err.message}`)
		}
	}

	public async getRoleById(id: string, info: any) {
		Logger.info('Inside getRoleById Datasource Service')
		try {
			if (id) {
				const projection = await ProjectionField.ParseProjectionField(info, this.model.schema.obj)

				return this._roleByIdLoader.load({ id, projection })
			}
			return null
		} catch (err) {
			Logger.error(`${err}`)
			throw new UserInputError(`${err.message}`)
		}
	}

	public async getRole(_id: string, projection: any): Promise<RoleDoc> {
		Logger.info('Inside getRole Datasource Service')
		try {
			return detailById(this.model, _id, projection)
		} catch (err) {
			Logger.error(`${err}`)
			throw new UserInputError(`${err.message}`)
		}
	}

	public async create(payload): Promise<RoleDoc> {
		Logger.info('Inside create Datasource Service')
		try {
			return create(this.model, payload)
		} catch (err) {
			Logger.error(`${err.message}`)
			throw new UserInputError(`${err.message}`)
		}
	}

	public async checkExistingRole(query): Promise<boolean> {
		Logger.info('Inside checkExistingRole Datasource Service')
		try {
			return checkFlag(this.model, query)
		} catch (err) {
			Logger.error(`${err.message}`)
			throw new UserInputError(`${err.message}`)
		}
	}

	public async updateRole(id: string, data: any) {
		Logger.info('Inside updateRole Datasource Service')
		try {
			return update(this.model, { _id: id, isActive: true }, data)
		} catch (err) {
			Logger.error(`${err.message}`)
			throw new UserInputError(`${err.message}`)
		}
	}

	public async getDefaultRole(query: any) {
		Logger.info('Inside getDefaultRole Datasource Service')
		try {
			return detail(this.model, query)
		} catch (err) {
			Logger.error(`${err.message}`)
			throw new UserInputError(`${err.message}`)
		}
	}
}
