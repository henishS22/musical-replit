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
import { MetadataDoc } from '@models/metadata'

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

export default class MetadataDataSource extends MongoDataSource<MetadataDoc> {
	public Metadata: any
	public metadataLoader: any
	private metadataPagination: any
	constructor(Metadata) {
		super(Metadata)
		this.metadataPagination = new Pagination(Metadata)
	}

	private _metadataByIdLoader = new DataLoader(async (keys: Keys[]) => {
		Logger.info('Inside _metadataByIdLoader')
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



	public async getMetadataList({ after, before, first, last, orderBy, filters }: GraphQLInput, info: any) {
		Logger.info('Inside getMetadataList Datasource Service')
		try {
			const sort = QueryResolver.GetSortObj(orderBy)
			let filter = {}
			if (filters && Object.keys(filters).length > 0) filter = QueryResolver.GetFilterObj(filters)

			const queryArgs = _.pickBy({ after, before, first, last, filter, sort }, _.identity)

			const projection = await ProjectionField.ParseProjectionField(info, this.model.schema.obj)

			const edges: Edge[] = await this.metadataPagination.GetEdges(queryArgs, projection)

			const pageInfo: PageInfo | any = await this.metadataPagination.GetPageInfo(edges, queryArgs)

			return { edges, pageInfo }
		} catch (err) {
			Logger.error(`${err.message}`)
			throw new UserInputError(`${err.message}`)
		}
	}


	public async getMetadataById(id: string, info: any) {
		Logger.info('Inside getMetadataById Datasource Service')
		try {
			if (id) {
				const projection = await ProjectionField.ParseProjectionField(info, this.model.schema.obj)

				return this._metadataByIdLoader.load({ id, projection })
			}
			return null
		} catch (err) {
			Logger.error(`${err}`)
			throw new UserInputError(`${err.message}`)
		}
	}
}
