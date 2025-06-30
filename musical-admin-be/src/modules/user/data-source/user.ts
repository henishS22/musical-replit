import _ from 'lodash'
import DataLoader from 'dataloader'
import moment from 'moment'
import { UserInputError } from 'apollo-server-errors'
import { MongoDataSource } from 'apollo-datasource-mongodb'
import { App, Logger } from '@core/globals'
import { UserSchemaDoc } from '@models/user'
import ProjectionField from '@helpers/projection-field'
import { Keys } from '@modules/role/data-source/role'
import { checkFlag, detail, update, create, details, count, projectDetail, ProjectAndTrackDetail } from '@helpers/mongoose'
import { increasedPercentage } from '@helpers/dashboard'
import Pagination from '@helpers/pagination'
import QueryResolver from '@helpers/query-resolver'
import { GraphQLInput, PageResponse, PageInfo, Edge } from '@modules/role/data-source/role'
// import { TradingHistory } from '@models/tradingHistory'

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

export default class UserDataSource extends MongoDataSource<UserSchemaDoc> {
	private userPagination: any
	constructor(User) {
		super(User)
		this.userPagination = new Pagination(User)
	}

	private _userByIdLoader = new DataLoader(async (keys: Keys[]) => {
		Logger.info('Inside _userByIdLoader')
		try {
			const ids = [...new Set(keys.map((key) => key.id))]
			const users = await this.model
				.find({ _id: { $in: ids } })
				.select(keys[0].projection)
				.exec()

			return keys.map((key) => {
				return users.find((user) => user._id.toString() === key.id.toString())
			})
		} catch (err) {
			Logger.error(`${err.message}`)
			throw new UserInputError(`${err.message}`)
		}
	})

	public async create(data: any): Promise<UserSchemaDoc> {
		Logger.info('Inside create user Datasource Service')
		try {
			return create(this.model, data)
		} catch (error) {
			Logger.error(error)
			throw new UserInputError(`${error.message}`)
		}
	}

	public async getUserById(id: string, info: any) {
		Logger.info('Inside getUserById Datasource Service')
		try {
			if (id) {
				let projection = await ProjectionField.ParseProjectionField(info, this.model.schema.obj)

				projection = projection.concat(' username')
				return this._userByIdLoader.load({ id, projection })
			}
			return null
		} catch (err) {
			Logger.error(`${err}`)
			throw new UserInputError(`${err.message}`)
		}
	}

	public async getUser(query: any, info: any) {
		Logger.info('Inside getUser Datasource Service')
		try {
			const projection = await ProjectionField.ParseProjectionField(info, this.model.schema.obj)

			return detail(this.model, query, projection)
		} catch (err) {
			Logger.error(`${err.message}`)
			throw new UserInputError(`${err.message}`)
		}
	}
	public async getUserCollectionStatus(query: any, info: any) {
		Logger.info('Inside getUserCollectionStatus Datasource Service')
		try {
			const wishlist = await this.model.findOne(query)
			return wishlist
		} catch (err) {
			Logger.error(`${err}`)
			throw new UserInputError(`${err.message}`)
		}
	}

	public async update(userId: string, user: any) {
		Logger.info('Inside update Datasource Service')
		try {
			return update(this.model, { _id: userId }, user)
		} catch (err) {
			Logger.error(`${err.message}`)
			throw new UserInputError(`${err.message}`)
		}
	}

	public async increamentCollection(id: string) {
		Logger.info('Inside increamentCollection Datasource Service')
		try {
			return update(this.model, { _id: id, isDeleted: false }, { $inc: { totalCollections: 1 } })
		} catch (err) {
			Logger.error(`${err.message}`)
			throw new UserInputError(`${err.message}`)
		}
	}

	public async updateUser(id: string, data: any): Promise<UserSchemaDoc> {
		Logger.info('Inside updateUser Datasource Service');
		try {
			const updatedUser = await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
			if (!updatedUser) {
				throw new UserInputError('User update failed');
			}
			return updatedUser;
		} catch (err) {
			Logger.error(`${err.message}`);
			throw new UserInputError(`${err.message}`);
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

	public async checkExistingUsers(ids: string[]) {
		Logger.info('Inside checkExistingUsers Datasource Service')
		try {
			const docs = await this.model.find({ _id: { $in: ids } }).countDocuments()

			return docs === ids.length
		} catch (err) {
			Logger.error(`${err.message}`)
			throw new UserInputError(`${err.message}`)
		}
	}

	public async getUsersDetailsByIds(ids: string[], info: any) {
		Logger.info('Inside getUsersDetailsByIds Datasource Service')
		try {
			if (ids.length <= 0) return []
			const projection = await ProjectionField.ParseProjectionField(info, this.model.schema.obj)
			return this.model
				.find({ _id: { $in: ids } })
				.select(projection)
				.exec()
		} catch (err) {
			Logger.error(`${err.message}`)
			throw new UserInputError(`${err.message}`)
		}
	}

	public async getUsers(
		{ after, before, first, last, orderBy, filters }: GraphQLInput,
		info: any
	): Promise<PageResponse> {
		Logger.info('Inside getUsers Datasource Service')
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

	public async search(keyword: string) {
		Logger.info('Inside find Datasource Service')
		try {
			const re = new RegExp(`^${keyword}.*`)
			const data = {
				username: { $regex: re, $options: 'i' },
			}
			const searchResult = await details(this.model, data)
			if (searchResult.length === 0) {
				return null
			}

			return searchResult.map((el) => {
				return {
					id: el._id,
					result: el.username,
					model: 'User',
					image: el?.profilePic,
				}
			})
		} catch (err) {
			Logger.error(`${err.message}`)
			throw new UserInputError(`${err.message}`)
		}
	}

	// public async upload(name: string, extension: string) {
	// 	Logger.info('Inside upload image Datasource Service')
	// 	try {
	// 		if (
	// 			name &&
	// 			extension &&
	// 			['jpg', 'jpeg', 'png', 'jfif', 'PNG', 'GIF', 'gif', 'webp', 'WEBP', 'csv'].includes(
	// 				extension
	// 			)
	// 		) {
	// 			const fileUploadPath = 'uploads'
	// 			const fileName = `${name}_${Date.now().toString()}.${extension}`
	// 			const s3FileUploadManager = new S3Manager(fileUploadPath)
	// 			const pathArr = []
	// 			App.Config.FILE_UPLOAD_CLOUDFRONT_URL && pathArr.push(App.Config.FILE_UPLOAD_CLOUDFRONT_URL)
	// 			fileUploadPath && pathArr.push(fileUploadPath)
	// 			fileName && pathArr.push(fileName)
	// 			const fullPath = pathArr.join('/')
	// 			const response = {
	// 				preSignedUrl: await s3FileUploadManager.generateSignedUrlForPutObject(
	// 					fileName,
	// 					extension
	// 				),
	// 				keyName: fileName,
	// 				s3Url: await s3FileUploadManager.generateSignedUrlForGetObject(
	// 					fileUploadPath + '/' + fileName
	// 				),
	// 				keyPath: ['/', fileUploadPath, '/', fileName].join(''),
	// 				fullPath: fullPath,
	// 			}
	// 			console.log(response, 'response from user')
	// 			return response
	// 		} else return null
	// 	} catch (error) {
	// 		Logger.error(error)
	// 		throw new UserInputError(`${error.message}`)
	// 	}
	// }

	public async getSingleUser(query: any) {
		Logger.info('Inside getUser Datasource Service')
		try {
			return await detail(this.model, query)
		} catch (err) {
			Logger.error(`${err.message}`)
			throw new UserInputError(`${err.message}`)
		}
	}

	public async getProjectById(model: any, query: any) {
		try {
			let data = []
			const projectData = await projectDetail(model, query)
			data = projectData.map((el) => {
				return {
					name: el.name,
					music: "30",
					minted_music: "28",
					collaborations: el.collaborators,
					createdAt: el.createdAt,
					updatedAt: el.updatedAt,
				}
			})
			return data;
		} catch (err) {
			Logger.error(`${err.message}`)
			throw new UserInputError(`${err.message}`)
		}
	}

	// public async getProjectAndTrackcount(query: any) {
	// 	try {
	// 		let result = []
	// 		const data = await ProjectAndTrackDetail(this.model, query)
	// 		result = data[0].projectList.map((el) => {
	// 			console.log(el, '====el=======');

	// 			const music = await App.Models.TrackProject.countDocuments({ projectId: el._id })
	// 			console.log(music, '==========');

	// 			return {
	// 				name: el.name,
	// 				music: "30",
	// 				minted_music: "28",
	// 				collaborations: el.collaborators,
	// 				createdAt: el.createdAt,
	// 				updatedAt: el.updatedAt,
	// 			}
	// 		})
	// 		data[0].projectList = result
	// 		return data;
	// 	} catch (err) {
	// 		Logger.error(`${err.message}`)
	// 		throw new UserInputError(`${err.message}`)
	// 	}
	// }


	public async getProjectAndTrackcount(query: any) {
		try {
			let result = []
			const data = await ProjectAndTrackDetail(this.model, query)


			result = await Promise.all(data[0].projectList.map(async (el) => {

				const music = await App.Models.TrackProject.countDocuments({ projectId: el._id })
				const minted_music = await App.Models.Nft.countDocuments({ project: el._id })

				return {
					name: el.name,
					music: music.toString(),
					minted_music: minted_music.toString(),
					collaborations: el.collaborators,
					createdAt: el.createdAt,
					updatedAt: el.updatedAt,
				}
			}))

			data[0].projectList = result
			return data;
		} catch (err) {
			Logger.error(`${err.message}`)
			throw new UserInputError(`${err.message}`)
		}
	}

	public async getDashboardUserData() {
		Logger.info('Inside getDashboardUserData Datasource Service')
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

	public async getUserGraphOnDashboard({ interval }: graphDataPayloadInterface) {
		Logger.info('Inside getUserGraphOnDashboard Datasource Service')
		try {
			const periods: periodInterface = {
				yearly: {
					indicator: 'month',
					index: 12,
				},
				monthly: {
					indicator: 'day',
					index: 31,
				},
				weekly: {
					indicator: 'day',
					index: 2,
				},
				daily: {
					indicator: 'hour',
					index: 24,
				},
			}

			const chainObject = []
			const arrMonth = []

			for (let index = 1; index <= periods[interval].index; index++) {
				const startDate = moment()
					.startOf(periods[interval].indicator)
					.subtract(index - 1, periods[interval].indicator)
					.format()
				const endDate = moment()
					.endOf(periods[interval].indicator)
					.subtract(index - 1, periods[interval].indicator)
					.format()

				const query = {
					accountTypeCode: 'USER',
					createdAt: {
						$gt: startDate,
						$lte: endDate,
					},
				}
				let countIncreased = await count(this.model, query)

				if (!countIncreased) {
					countIncreased = 0
				}

				const objParams = {
					value: countIncreased,
					datetime: moment()
						.startOf(periods[interval].indicator)
						.subtract(index - 1, periods[interval].indicator)
						.format('YYYY-DD-MMM HH:mm')
				}
				arrMonth[`data${index}`] = objParams
			}
			const data = { arrMonth }
			chainObject.push(data)
			return chainObject
		} catch (err) {
			Logger.error(`${err.message}`)
			throw new UserInputError(`${err.message}`)
		}
	}
}
