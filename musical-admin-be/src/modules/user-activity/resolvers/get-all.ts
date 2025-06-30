import { App } from '@core/globals'
import { Logger } from '@core/logger'
import { UserInputError } from 'apollo-server-errors'
import mongoose from 'mongoose'
const { ObjectId } = mongoose.Types

export const userActivityList = {
	Query: {
		async userActivityList(_: any, args: any, context: any) {
			Logger.info('Inside userActivityList Resolver')
			try {
				const { after, before, first, last, orderBy, filters } = args
				const limit = first || last || 10

				if (first && last) {
					throw new UserInputError("Cannot use both 'first' and 'last'. Choose one.")
				}
				if (first < 0 || last < 0) {
					throw new UserInputError("`first` and `last` must be positive numbers.")
				}

				// Build basic filter for cursor-based pagination
				const filter: any = {}
				if (after) {
					filter._id = { $gt: new ObjectId(after) }
				}
				if (before) {
					filter._id = { $lt: new ObjectId(before) }
				}

				// Add search filter if provided
				if (filters && filters.search) {
					const searchRegex = new RegExp(filters.search, "i");
					filter.$or = [
						{ "name": { $regex: searchRegex } },
						{ "email": { $regex: searchRegex } }
					];
				}

				let sortField = "_id";
				let sortDirection = 1;

				if (orderBy) {
					const [field, direction] = orderBy.split('_');
					sortField = field;
					sortDirection = direction === "ASC" ? 1 : -1;
				}

				const pipeline: any = [
					{ $match: {} },
					{
						$group: {
							_id: "$userId",
							totalPoints: { $sum: "$points" },
							totalEventsPerformed: { $sum: "$occurrence" }
						}
					},
					{
						$lookup: {
							from: "users",
							localField: "_id",
							foreignField: "_id",
							as: "user"
						}
					},
					{ $unwind: "$user" },
					{
						$project: {
							userId: "$_id",
							totalPoints: 1,
							totalEventsPerformed: 1,
							name: "$user.username",
							email: "$user.email",
							_id: 1
						}
					},
					{ $match: filter },
					{ $sort: { [sortField]: sortDirection, _id: 1 } },
					{ $limit: limit + 1 }
				]

				const results = await App.Models.UserActivity.aggregate(pipeline)

				const hasExtra = results.length > limit
				const slicedResults = hasExtra ? results.slice(0, -1) : results

				const edges = slicedResults.map(doc => ({
					cursor: doc._id.toString(),
					node: doc
				}))

				const pageInfo = {
					hasNextPage: hasExtra,
					hasPreviousPage: !!after || !!before,
					startCursor: edges[0]?.cursor || null,
					endCursor: edges[edges.length - 1]?.cursor || null
				}

				const points = await App.Models.UserActivity.aggregate([
					{ $group: { _id: null, totalPoints: { $sum: "$points" } } }
				])

				const totalPoints = points.length ? points[0].totalPoints : 0

				return {
					totalPoints,
					edges,
					pageInfo
				}
			} catch (err) {
				Logger.error(`${err}`)
				throw new UserInputError(`${err.message}`)
			}
		}

	}
}