import _ from 'lodash'
import { UserInputError } from 'apollo-server-errors'
import { MongoDataSource } from 'apollo-datasource-mongodb'
import { Logger } from '@core/globals'
import { AdminSchemaDoc, AdminDoc } from '@models/admin'
import ProjectionField from '@helpers/projection-field'
import Pagination from '@helpers/pagination'
import QueryResolver from '@helpers/query-resolver'
import { detailById, create, update, adminCreate, checkFlag } from '@helpers/mongoose'
import { GraphQLInput, PageResponse, PageInfo, Edge } from '@modules/role/data-source/role'

export default class AdminDataSource extends MongoDataSource<AdminSchemaDoc> {
	private userPagination: any
	constructor(Admin) {
		super(Admin)
		this.userPagination = new Pagination(Admin)
	}

	public async getAdmins(
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

			const edges: Edge[] = await this.userPagination.GetEdges(queryArgs, projection)

			const pageInfo: PageInfo | any = await this.userPagination.GetPageInfo(edges, queryArgs)

			return { edges, pageInfo }
		} catch (err) {
			Logger.error(`${err.message}`)
			throw new UserInputError(`${err.message}`)
		}
	}

	public async getUserAccessRequests(
		{ after, before, first, last, orderBy, filters }: GraphQLInput,
		info: any
	): Promise<PageResponse> {
		Logger.info('Inside getUserAccessRequests Datasource Service')
		try {
			const sort = QueryResolver.GetSortObj(orderBy)
			let filter = {}
			if (filters && Object.keys(filters).length > 0) {
				filter = QueryResolver.GetFilterObj(filters)
			}
			filter = {
				isCollectionAccess: false,
				reason: { $exists: true, $ne: null },
			}
			const queryArgs = _.pickBy({ after, before, first, last, filter, sort }, _.identity)
			const projection = await ProjectionField.ParseProjectionField(info, this.model.schema.obj)
			const edges: Edge[] = await this.userPagination.GetEdges(queryArgs, projection)
			const pageInfo: PageInfo | any = await this.userPagination.GetPageInfo(edges, queryArgs)
			return { edges, pageInfo }
		} catch (err) {
			Logger.error(`${err.message}`)
			throw new UserInputError(`${err.message}`)
		}
	}

	public getUser(userId: string): Promise<AdminDoc> {
		Logger.info('Inside getUser Datasource Service')
		try {
			return detailById(this.model, userId)
		} catch (err) {
			Logger.error(`${err.message}`)
			throw new UserInputError(`${err.message}`)
		}
	}

	public async getUserByUsername(username: string): Promise<AdminDoc> {
		Logger.info('Inside getUserByUsername Datasource Service');
		try {
			const user = await this.model.findOne({ username }).exec();
			if (!user) {
				throw new UserInputError('User not found');
			}
			return user;
		} catch (err) {
			Logger.error(`${err.message}`);
			throw new UserInputError(`${err.message}`);
		}
	}

	public async updateUser(id: string, data: any): Promise<AdminDoc> {
		Logger.info('Inside updateUser Datasource Service');
		try {
			const updatedUser = await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
			if (!updatedUser) {
				throw new UserInputError('Admin update failed');
			}
			return updatedUser;
		} catch (err) {
			Logger.error(`${err.message}`);
			throw new UserInputError(`${err.message}`);
		}
	}
	public async create(payload: any): Promise<AdminDoc> {
		Logger.info('Inside create Datasource Service')
		try {
			return adminCreate(this.model, payload)
		} catch (err) {
			Logger.error(`${err.message}`)
			throw new UserInputError(`${err.message}`)
		}
	}

	public async updateAdmin(id: string, data: any) {
		Logger.info('Inside updateAdmin Datasource Service')
		try {
			return update(this.model, { _id: id, isDeleted: false }, data)
		} catch (err) {
			Logger.error(`${err.message}`)
			throw new UserInputError(`${err.message}`)
		}
	}

	public async checkExistingUser(query: any) {
		Logger.info('Inside checkExistingUser Datasource Service')
		try {
			return checkFlag(this.model, query)
		} catch (err) {
			Logger.error(`${err.message}`)
			throw new UserInputError(`${err.message}`)
		}
	}
}
