import { App } from '@core/globals'

import RoleDataSource from '@modules/role/data-source/role'
import AuthDataSource from '@modules/auth/data-source/auth'
import UserDataSource from '@modules/user/data-source/user'
// import UserDataSource from '@modules/user/data-source/user'
import AdminDataSource from '@modules/admin/data-source/admin'
// global malvtic
import ProjectDataSource from '@modules/project/data-source/project'
import ActivityDataSource from '@modules/activity/data-source/activity'
import SubscriptionDataSource from '@modules/subscription/data-source/subscription'
import DistroDataSource from '@modules/distro/data-source/distro'
import MetadataDataSource from '@modules/metadata/data-source/metadata'
import TransactionDataSource from '@modules/dashboard/data-source/transaction'
import GamificationDataSource from '@modules/gamification/data-source/gamification'
import UserActivityDataSource from '@modules/user-activity/data-source/userActivity'

export interface Datasources {
	Admin: AdminDataSource
	Role: RoleDataSource
	Auth: AuthDataSource
	User: UserDataSource
	ProjectDataSource: ProjectDataSource
	Activity: ActivityDataSource
	Subscription: SubscriptionDataSource
	Distro: DistroDataSource
	Metadata: MetadataDataSource
	Transaction: TransactionDataSource
	Gamification: GamificationDataSource
	UserActivity: UserActivityDataSource
}

export default () => {
	return {
		Auth: new AuthDataSource(App.Models.Admin),
		User: new UserDataSource(App.Models.User),
		Role: new RoleDataSource(App.Models.Role),
		Admin: new AdminDataSource(App.Models.Admin),
		Project: new ProjectDataSource(App.Models.Project),
		Activity: new ActivityDataSource(App.Models.Activity),
		Subscription: new SubscriptionDataSource(App.Models.Subscription),
		Distro: new DistroDataSource(App.Models.Distro),
		Metadata: new MetadataDataSource(App.Models.Metadata),
		Transaction: new TransactionDataSource(App.Models.Transaction),
		Gamification: new GamificationDataSource(App.Models.Gamification),
		UserActivity: new UserActivityDataSource(App.Models.UserActivity),
	}
}
