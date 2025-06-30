
import { gql } from 'apollo-server-express'

const userActivityTypes = gql`
	type Query {
		"A list of gamification event"
		userActivityList(
			after: String
			before: String
			first: Int
			last: Int
			orderBy: UserActivityOrderByInput!
			filters: UserActivityWhereInput
		): UserActivityConnection
	}

	input UserActivityWhereInput {
		search:String
		status:String
		userId:ID
	}

	type UserActivity {
		id: ID!
        eventName:String
		eventId:Gamification
		points:String
		occurrence:String
		maxOccurrence:String
		userId:User
		createdAt:String
		updatedAt:String
	}

	type ActivityData {
		_id: ID!
		totalPoints: Float
		totalEventsPerformed: Float
		userId: ID
		name: String
		email:String
	}

	type UserActivityEdge {
		"A cursor for use in pagination."
		cursor: ID!
		"A post at the end of an edge."
		node: ActivityData
	}

	type PageInfo {
		"The cursor to continue from when paginating forward."
		endCursor: ID
		"Whether there are more items when paginating forward."
		hasNextPage: Boolean!
		"Whether there are more items when paginating backward."
		hasPreviousPage: Boolean!
		"The cursor to continue from them paginating backward."
		startCursor: ID
	}

	type UserActivityConnection {
	    totalPoints:Float
		"A list of post edges."
		edges: [UserActivityEdge]
		"Information to assist with pagination."
		pageInfo: PageInfo!
	}

	enum UserActivityOrderByInput {
		"Order role ascending by creation time."
		createdAt_ASC
		"Order role decending by creation time."
		createdAt_DESC
		"Order role ascending by name."
		name_ASC
		"Order role ascending by name."
		name_DESC

		totalPoints_DESC
		totalPoints_ASC
	}

`

export default userActivityTypes










// import { gql } from 'apollo-server-express'

// const userActivityTypes = gql`
// 	type Query {
// 		"A list of gamification event"
// 		userActivityList(
// 			after: String
// 			before: String
// 			first: Int
// 			last: Int
// 			orderBy: UserActivityOrderByInput!
// 			filters: UserActivityWhereInput
// 		): UserActivityConnection!
// 	}

// 	input UserActivityWhereInput {
// 		search:String
// 		status:String
// 		userId:ID
// 	}

// 	type UserActivity {
// 		id: ID!
//         eventName:String
// 		eventId:Gamification
// 		points:String
// 		occurrence:String
// 		maxOccurrence:String
// 		userId:User
// 		createdAt:String
// 		updatedAt:String
// 	}

// 	type UserActivityEdge {
// 		"A cursor for use in pagination."
// 		cursor: ID!
// 		"A post at the end of an edge."
// 		node: UserActivity
// 	}

// 	type PageInfo {
// 		"The cursor to continue from when paginating forward."
// 		endCursor: ID
// 		"Whether there are more items when paginating forward."
// 		hasNextPage: Boolean!
// 		"Whether there are more items when paginating backward."
// 		hasPreviousPage: Boolean!
// 		"The cursor to continue from them paginating backward."
// 		startCursor: ID
// 	}

// 	type UserActivityConnection {
// 		"A list of post edges."
// 		edges: [UserActivityEdge]
// 		"Information to assist with pagination."
// 		pageInfo: PageInfo!
// 	}

// 	enum UserActivityOrderByInput {
// 		"Order role ascending by creation time."
// 		createdAt_ASC
// 		"Order role decending by creation time."
// 		createdAt_DESC
// 		"Order role ascending by name."
// 		name_ASC
// 		"Order role ascending by name."
// 		name_DESC
// 	}

// `

// export default userActivityTypes
