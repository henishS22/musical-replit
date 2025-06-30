import { gql } from 'apollo-server-express'

const distroTypes = gql`
	type Query {
		"A list of roles"
		distroList(
			after: String
			before: String
			first: Int
			last: Int
			orderBy: DistroOrderByInput!
			filters: DistroWhereInput
		): DistroConnection!

		"A role details"
		distro(id: String!): Distro!
	}

	type Mutation {
		distroStatus(where: DistroWhereUpdateInput!, input: UpdateStatusInput!): messageResponse!
	}
		
	input DistroWhereUpdateInput {
		id: ID!
	}

	input UpdateStatusInput {
		status: statusCode
	}
		
	enum statusCode {
		APPROVED
		REJECTED
	}
	

	type Distro {
		id: ID!
		userId: User 
		spotify: String
		youtube: String
		userName: String
		tiktok: String
		apple: String
		instagram: String
		x: String
		message: String
		status: String
		createdAt:Date
		updatedAt:Date
	}

	type DistroEdge {
		"A cursor for use in pagination."
		cursor: ID!
		"A post at the end of an edge."
		node: Distro
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

	type DistroConnection {
		"A list of post edges."
		edges: [DistroEdge]
		"Information to assist with pagination."
		pageInfo: PageInfo!
	}

	type messageResponse {
		"Response Message in string for success or failure."
		message: String!
		"Status of the response in boolean for success or failure."
		status: String!
	}

	enum DistroOrderByInput {
		"Order role ascending by creation time."
		createdAt_ASC
		"Order role decending by creation time."
		createdAt_DESC
		"Order role ascending by name."
		name_ASC
		"Order role ascending by name."
		name_DESC
	}

	input DistroWhereInput {
		searchDistro:String
		statusMatch:String
	}
`

export default distroTypes
