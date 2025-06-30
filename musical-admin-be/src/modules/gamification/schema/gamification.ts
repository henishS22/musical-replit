import { gql } from 'apollo-server-express'

const gamificationTypes = gql`

    type Mutation {
		"Creates a new gamification event with the specified details."
		createEvent(input: CreateEventInput!): messageResponse!

		"Update Event data"
		updateEvent(where: GamificationWhereUpdateInput!, input: GamificationUpdateInput!): messageResponse!

		"Update Event status"
		updateStatus(where: GamificationWhereUpdateInput!, input: GamificationStatusInput!): messageResponse!
	}

	type Query {
		"A list of gamification event"
		gamificationList(
			after: String
			before: String
			first: Int
			last: Int
			orderBy: GamificationOrderByInput!
			filters: GamificationWhereInput
		): GamificationConnection!

		"A event details"
		gamification(id: String!): Gamification!
	}

	input GamificationWhereUpdateInput {
		id: ID!
	}

	input GamificationStatusInput {
		isActive:Boolean
	}

	input GamificationUpdateInput {
		occurrence: Int
        points: Float
        name: String
	}


	input CreateEventInput {
		"Name of the event (e.g., 'User Signed Up')."
        name: String
		"Unique identifier for the event (e.g., 'user_signup')."
        identifier: String
		"Number of points awarded for the event."
        points: Float
		"Number of times this event can occur (e.g., 1 for one-time)."
        occurrence: Int
	}

	input GamificationWhereInput {
		search:String
		status:String
	}

	type Gamification {
		id: ID!
        occurrence: Int
        points: Float
        identifier: String
        name: String
		isActive:Boolean
		createdById:Admin
		updatedById:Admin
	}

	type GamificationEdge {
		"A cursor for use in pagination."
		cursor: ID!
		"A post at the end of an edge."
		node: Gamification
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

	type GamificationConnection {
		"A list of post edges."
		edges: [GamificationEdge]
		"Information to assist with pagination."
		pageInfo: PageInfo!
	}

	enum GamificationOrderByInput {
		"Order role ascending by creation time."
		createdAt_ASC
		"Order role decending by creation time."
		createdAt_DESC
		"Order role ascending by name."
		name_ASC
		"Order role ascending by name."
		name_DESC
	}

	type messageResponse {
		"Response Message in string for success or failure."
		message: String!
		"Status of the response in boolean for success or failure."
		status: String!
	}

`

export default gamificationTypes
