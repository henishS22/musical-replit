import { gql } from 'apollo-server-express'

const projectTypes = gql`
	type Query {
		"A list of project"
		projects(
			after: String
			before: String
			first: Int
			last: Int
			orderBy: ProjectOrderByInput!
			filters: ProjectWhereInput
		): ProjectConnection!
		"Search acrross project and categories"
		searchProject(input: SearchInput!): SearchResponsePayload!

	}

	type ProjectEdge {
		"A cursor for use in pagination."
		cursor: ID!
		"A post at the end of an edge."
		node: Project
	}

	type ProjectConnection {
		"A list of post edges."
		edges: [ProjectEdge]
		"Information to assist with pagination."
		pageInfo: PageInfo!
	}

	type ResponsePayload {
		"Response message in string"
		message: String!
		"Status of the response in boolean for success or failure"
		status: String!
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

	type SearchResponsePayload {
		"Response message in string"
		message: String!
		"Status of the response in boolean for success or failure"
		status: String!
		"Search result data for the keyword provided by the user"
		ProjectResult: [Project]
	}

	type Project {
		"project id"
		id: ID!
		name: String
		music: String
		minted_music: String
		collaborations: [Collaborators]
		createdAt: Date
		updatedAt: Date
	}

	type Collaborators {
		user: ID
		email: String
		invitedForProject:Boolean
		roles: [String]
		permission: String
		split: String
	}

	input Input {
		"User Id to of the user."
		id: String!
	}

	enum ProjectOrderByInput {
		"Order admins ascending by creation time."
		createdAt_ASC
		"Order admins descending by creation time."
		createdAt_DESC
		"Order admins ascending by name"
		name_ASC
	}
	
	input ProjectWhereInput {
		createdAtFrom: String
		createdAtTo: String
		type: String
		name: String
		
	}
	scalar Date

	input SearchInput {
		"Keyword for search "
		keyword: String
	}
`

export default projectTypes
