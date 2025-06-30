import { gql } from 'apollo-server-express'

const roleTypes = gql`
	type Query {
		"A list of roles"
		roles(
			after: String
			before: String
			first: Int
			last: Int
			orderBy: RoleOrderByInput!
			filters: RoleWhereInput
		): RoleConnection!
		"A role details"
		role(id: String!): Role!
	}

	type Mutation {
		"To create a role"
		createRole(input: CreateRoleInput!): messageResponse!
		"Update Role with Permissions of Superuser"
		updateRole(where: RoleWhereUpdateInput!, input: UpdateRoleInput!): messageResponse!
		"Delete Role with Permissions of Superuser"
		deleteRole(where: RoleWhereUpdateInput!): messageResponse!
	}

	type Role {
		id: ID!
		name: String!
		isActive: Boolean!
		permissions: Permissions!
		createdBy: User
		createdAt: Date
	}

	type Permissions {
		User: UserBoolean
		Subscription:AllBoolean
		Distro: AllBoolean
		Release: AllBoolean
	}

	type AllBoolean {
	    ALL: Boolean!
	}

	type PermissionsBoolean {
		GET: Boolean!
		CREATE: Boolean!
		UPDATE: Boolean!
		DELETE: Boolean!
	}
	
	type UserBoolean {
		BAN: Boolean!
	    GET: Boolean!
	}

	type RoleEdge {
		"A cursor for use in pagination."
		cursor: ID!
		"A post at the end of an edge."
		node: Role
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

	type RoleConnection {
		"A list of post edges."
		edges: [RoleEdge]
		"Information to assist with pagination."
		pageInfo: PageInfo!
	}

	type messageResponse {
		"Response Message in string for success or failure."
		message: String!
		"Status of the response in boolean for success or failure."
		status: String!
	}

	enum RoleOrderByInput {
		"Order role ascending by creation time."
		createdAt_ASC
		"Order role decending by creation time."
		createdAt_DESC
		"Order role ascending by name."
		name_ASC
		"Order role ascending by name."
		name_DESC
	}

	input RoleWhereInput {
		"Search point for key name in roles"
		name: String
		"Role status enum for true or false"
		isActiveBool: String
		"A date in proper format for createdAt from"
		createdAtFrom: String
		"A date in proper format for createdAt to"
		createdAtTo: String
		"Filter Based On Created By, Pass Object ID"
		createdById: ID
	}

	input PermissionsInput {
		User: UserBooleanInput
		Subscription:AllBooleanInput
		Distro:AllBooleanInput
		Release:AllBooleanInput
	}

	input PermissionsBooleanInput {
		GET: Boolean!
		CREATE: Boolean!
		UPDATE: Boolean!
		DELETE: Boolean!
	}

	input UserBooleanInput {
		GET: Boolean!
		BAN: Boolean!
	}

	input AllBooleanInput {
		ALL: Boolean!
	}

	input CreateRoleInput {
		"Name of the role to create."
		name: String! @constraint(maxLength: 50)
		"Permissions for the role"
		permissions: PermissionsInput!
	}

	input RoleWhereUpdateInput {
		"Role id of the role"
		id: ID!
	}

	input UpdateRoleInput {
		"Name of the role to create."
		name: String @constraint(maxLength: 50)
		"Permissions for the role"
		permissions: PermissionsInput
	}
`

export default roleTypes
