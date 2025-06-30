import _ from 'lodash'
import { Logger } from '@core/globals'

export const adminCreate = (model: any, data: any) => {
	Logger.info('Inside adminCreate mongoose service')
	const query = {
		$or: [
			{ email: data.email },
			{ mobile: data.mobile }
		]
	}
	return model.findOneAndUpdate(query, data, { upsert: true, new: true })
}

export const create = (model: any, data: any) => {
	Logger.info('Inside create mongoose service')
	return model.create(data)
}

export const update = (model: any, query: any, data: any) => {
	Logger.info('Inside update mongoose service')
	query = _.pickBy({ ...query }, _.identity)
	return model.findOneAndUpdate(query, data, { new: true }).lean()
}
export const pull = (model: any, query: any, data: any) => {
	Logger.info('Inside pull mongoose service')
	query = _.pickBy({ ...query }, _.identity)
	return model.findOneAndUpdate(query, { $pull: data }).lean()
}
export const deleteDoc = (model: any, query: any) => {
	Logger.info('Inside deleteDoc mongoose service')
	return update(model, query, { isDeleted: true, isActive: false })
}

export const detail = async (model: any, query: any, projection: any = null) => {
	Logger.info('Inside detail mongoose service')
	query = _.pickBy({ ...query }, _.identity)
	return await model.findOne(query, projection).sort({ createdAt: -1 }).lean()
}

export const projectDetail = async (model: any, query: any, projection: any = null) => {
	Logger.info('Inside detail mongoose service')
	query = _.pickBy({ ...query }, _.identity)
	let data = await model.find(query).lean()
	return data;
}

export const ProjectAndTrackDetail = async (model: any, query: any) => {
	Logger.info('Inside detail mongoose service')
	//query = _.pickBy({ ...query }, _.identity)
	let data = await model.aggregate(query);
	return data
}



export const checkFlag = async (model: any, query: any) => {
	Logger.info('Inside checkFlag mongoose service')
	const doc = await model.find(query).countDocuments()
	return !!doc
}

export const detailById = (model: any, id: string, projection: any = null) => {
	Logger.info('Inside detailById mongoose service')
	return model.findById(id, projection).lean()
}

export const details = (model: any, query: any) => {
	Logger.info('Inside details mongoose service')
	return model.find(query).lean()
}

export const updateArray = (model: any, query: any, data: any) => {
	Logger.info('Inside update mongoose service')
	query = _.pickBy({ ...query }, _.identity)
	return model.findOneAndUpdate(query, { $addToSet: data }).lean()
}
export const count = async (model: any, query: any) => {
	Logger.info('Inside count mongoose service')
	return model.countDocuments(query)
}
export const countDocuments = async (model: any) => {
	Logger.info('Inside countDocuments mongoose service')
	return model.count()
}
