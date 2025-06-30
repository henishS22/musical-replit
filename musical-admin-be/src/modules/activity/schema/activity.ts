import { gql } from 'apollo-server-express'

const adminTypes = gql`
	type Query {
		"Get activity details"
		activity(input: ActivityInput!): Activity!
	}
	input ActivityInput {
		"User or role Id"
		id: String!
		"Type of the activity"
		type: activityCode
	}
	type Activity {
		"Activity id"
		id: ID!
		"Activities of the user"
		activities: [String]
		"User information of the activity"
		user: User
		"Role information of the activity"
		role: Role
	}
	enum activityCode {
		"Fetch the deatils for the role activity."
		ROLE
		"Fetch the deatils for the User activity."
		USER
	}
`

export default adminTypes
