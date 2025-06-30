import { UserInputError } from 'apollo-server-errors';
import { App, Logger } from '@core/globals';
import { UserDoc } from '@models/user';

interface Context {
	user: UserDoc;
	dataSources: any;
}

interface DashboardResponse {
	message: string;
	status: string;
	userdata?: number;
	trackData?: number;
	projectData?: number;
	subscription?: number;
	ipfsStorage?: number;
	dropboxStorage?: number;
	driveStorage?: number;
	totalPoint?: number;
}

export const dashboard = {
	Query: {
		async dashboard(_: any, __: any, { user }: Context): Promise<DashboardResponse> {
			Logger.info('Fetching dashboard data');

			if (!user) {
				return {
					message: 'Invalid token. User details not found.',
					status: 'error',
				};
			}

			try {
				const [
					userCount,
					projectCount,
					trackCount,
					driveData,
					freeSubscription,
					pointsAgg
				] = await Promise.all([
					App.Models.User.estimatedDocumentCount(),
					App.Models.Project.estimatedDocumentCount(),
					App.Models.Track.estimatedDocumentCount(),
					App.Models.UserSubscription.find({}, { usage: 1 }).lean(),
					App.Models.Subscription.findOne({ isFree: true, status: 'active', isDeleted: false }).lean(),
					App.Models.UserActivity.aggregate([
						{ $group: { _id: null, totalPoints: { $sum: "$points" } } }
					])
				]);

				// Storage calculation
				const totalStorage = driveData.reduce((sum, sub) => {
					const storageUsage = sub.usage?.filter((u: any) => u.featureKey === 'storage') || [];
					return sum + storageUsage.reduce((acc: number, usage: any) => acc + parseFloat(usage.usage || '0'), 0);
				}, 0);

				// Count non-free subscriptions
				const subscriptionCount = freeSubscription
					? await App.Models.UserSubscription.countDocuments({
						subscriptionId: { $ne: freeSubscription._id.toString() }
					})
					: 0;

				return {
					userdata: userCount || 0,
					projectData: projectCount || 0,
					trackData: trackCount || 0,
					subscription: subscriptionCount || 0,
					ipfsStorage: 0,
					dropboxStorage: 0,
					driveStorage: totalStorage || 0,
					totalPoint: pointsAgg[0]?.totalPoints || 0,
					message: 'Dashboard data fetched successfully',
					status: 'success',
				};
			} catch (err) {
				Logger.error(`Dashboard fetch error: ${err.message}`);
				throw new UserInputError(`Error fetching dashboard data: ${err.message}`);
			}
		},
	},
};