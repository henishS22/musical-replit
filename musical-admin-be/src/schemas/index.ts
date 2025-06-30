import { makeExecutableSchema } from '@graphql-tools/schema'
import { gql } from 'apollo-server-express'
import { GraphQLUpload } from 'graphql-upload';
import { mergeTypeDefs } from '@graphql-tools/merge'
import _ from 'lodash'
import { applyMiddleware } from 'graphql-middleware'
import { constraintDirective, constraintDirectiveTypeDefs } from 'graphql-constraint-directive'
// import { customScalarResolvers } from '../custom-scalars'

import roleTypes from '@modules/role/schema/role'
import authTypes from '@modules/auth/schema/auth'
import userTypes from '@modules/user/schema/user'
import activityTypes from '@modules/activity/schema/activity'
import adminTypes from '@modules/admin/schema/admin'
import meTypes from '@modules/me/schema/me'
import dashboardTypes from '@modules/dashboard/schema/dashboard'
import Permissions from '@middlewares/permissions'
// multivac
import projectTypes from '@modules/project/schema/project';
import subscriptionTypes from '@modules/subscription/schema/subscription';
import distroTypes from '@modules/distro/schema/distro';

import { Anything } from '../custom-scalars/object'
import { rolesResolvers } from '@modules/role/resolvers'
import { authResolvers } from '@modules/auth/resolvers'
import { userResolvers } from '@modules/user/resolvers'
import { adminResolvers } from '@modules/admin/resolvers'
import { meResolvers } from '@modules/me/resolvers'
import { dashboardResolvers } from '@modules/dashboard/resolver'
// // 
import { projectResolvers } from '@modules/project/resolvers';
import { activityResolvers } from '@modules/activity/resolvers';
import { subscriptionResolvers } from '@modules/subscription/resolvers'
import { distroResolvers } from '@modules/distro/resolvers';
import metadataTypes from '@modules/metadata/schema/metadata';
import { metadataResolvers } from '@modules/metadata/resolvers';
import { gamificationResolvers } from '@modules/gamification/resolvers';
import gamificationTypes from '@modules/gamification/schema/gamification';
import userActivityTypes from '@modules/user-activity/schema/userActivity';
import { userActivityResolvers } from '@modules/user-activity/resolvers';


const Query = gql`
    scalar Anything

	type Query {
		ping: Success!
	}

	type Mutation {
		ping: Success!
	}

	enum Success {
		SUCCESS
	}

	type FileResponse {
		filename: String!
		mimetype: String!
		encoding: String!
	}
`

const resolver = {
	Query: {
		ping: () => 'SUCCESS',
	},
	Mutation: {
		ping: () => 'SUCCESS',
		// from above mutation - after ping		// uploadFile(file: Upload!): FileResponse!

		// uploadFile: async (_, { file }, { }) => {
		// 	const { createReadStream, filename, mimetype, encoding } = await file;
		// 	// Process the file (e.g., save to disk, cloud storage, etc.)
		// 	return {
		// 		createReadStream,
		// 		filename,
		// 		mimetype,
		// 		encoding,
		// 	};
		// },
	},
	Anything,
	// Upload: GraphQLUpload,
}

const typeDefs = mergeTypeDefs([
	Query,
	roleTypes,
	activityTypes,
	authTypes,
	userTypes,
	adminTypes,
	meTypes,
	dashboardTypes,
	// 
	subscriptionTypes,
	projectTypes,
	distroTypes,
	metadataTypes,
	gamificationTypes,
	userActivityTypes

])
const resolvers = _.merge(
	resolver,
	activityResolvers,
	rolesResolvers,
	authResolvers,
	userResolvers,
	adminResolvers,
	meResolvers,
	dashboardResolvers,
	subscriptionResolvers,
	projectResolvers,
	distroResolvers,
	metadataResolvers,
	gamificationResolvers,
	userActivityResolvers
)

const schema = constraintDirective()(
	makeExecutableSchema({
		typeDefs: [typeDefs, constraintDirectiveTypeDefs],
		resolvers,
	})
)

export const schemaWithMiddleware = applyMiddleware(schema, Permissions)
