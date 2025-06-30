import { gql } from 'apollo-server-express'

const subscriptionTypes = gql`
	type Query {
		"Get a subscription by ID"
		subscription(id: String!): Subscription!
		"A list of subscriptions"
		subscriptions(
			after: String
			before: String
			first: Int
			last: Int
			orderBy: SubscriptionOrderByInput!
			filters: SubscriptionWhereInput
		): SubscriptionConnection!
		"Get available subscription features"
		subscriptionFeatures: FeatureOptions!
	}

	type Mutation {
		"Create a new subscription"
		createSubscription(input: CreateSubscriptionInput!): SubscriptionResponse!
		"Update an existing subscription"
		updateSubscription(where: SubscriptionWhereUpdateInput!, input: UpdateSubscriptionInput!): SubscriptionResponse!
		"Delete a subscription"
		deleteSubscription(where: SubscriptionWhereUpdateInput!): SubscriptionDeleteResponse!
	}

	type Subscription {
		"ID of the subscription"
		id: ID!
		"Coinflow Plan ID"
		coinflowPlanId: String
		"Name of the subscription plan"
		name: String!
		"Plan code"
		planCode: String!
		"Description of the subscription plan"
		description: String!
		"Type of subscription (subscription or addon)"
		type: SubscriptionType!
		"Price of the subscription"
		price: Float!
		"Interval for billing (Monthly, Yearly, Lifetime)"
		interval: SubscriptionInterval!
		"Duration in number of intervals (optional)"
		duration: Int
		"Currency code"
		currency: String!
		"Features included in the subscription"
		features: [Feature!]
		"Status of the subscription"
		status: String!
		"ID of the user who created the subscription"
		createdById: ID!
		"ID of the user who last updated the subscription"
		updatedById: ID
		"Creation timestamp"
		createdAt: String
		"Last update timestamp"
		updatedAt: String
		"Is subscription deleted"
		isDeleted:Boolean
	}

	"Subscription type enum"
	enum SubscriptionType {
		subscription
		addon
	}

	"Subscription interval enum"
	enum SubscriptionInterval {
		Monthly
		Yearly
		Lifetime
	}

	enum SubscriptionOrderByInput {
		"Order admins ascending by creation time."
		createdAt_ASC
		"Order admins descending by creation time."
		createdAt_DESC
		"Order admins ascending by email."
		email_ASC
		"Order admins ascending by email."
		email_DESC
		"Order admins ascending by name"
		name_ASC
	}

	input SubscriptionWhereInput {
		"Filter by type (subscription or addon)"
		typeMatch: SubscriptionType
		"Search by name or plan code"
		subSearch: String
	}

	type SubscriptionEdge {
		"A cursor for use in pagination."
		cursor: ID!
		"A post at the end of an edge."
		node: Subscription
	}
		
	type SubscriptionConnection {
		"A list of post edges."
		edges: [SubscriptionEdge]
		"Information to assist with pagination."
		pageInfo: PageInfo!
	}

	type Feature {
		"Unique key for the feature"
		featureKey: String!
		"Description of the feature"
		description: String!
		"Description when feature is not available"
		not_available_description: String
		"Whether the feature is available"
		available: Boolean
		"Limit for this feature (if applicable)"
		limit: String
		"Unit of measurement"
		unit: String
	}

	type FeatureOptions {
		"List of available features"
		features: [FeatureOption!]!
	}

	type FeatureOption {
		"Feature ID"
		id: String!
		"Feature name"
		name: String!
		"Unit of measurement"
		unit: String
		"Whether the feature has a limit"
		limit: Boolean
		"Feature description"
		description: String!
		"Description when feature is not available"
		not_available_description: String
	}

	input CreateSubscriptionInput {
		"Name of the subscription plan"
		name: String!
		"Plan code"
		planCode: String!
		"Description of the subscription plan"
		description: String!
		"Type of subscription"
		type: SubscriptionType!
		"Price of the subscription"
		price: Float!
		"Interval for billing"
		interval: SubscriptionInterval!
		"Duration in number of intervals (optional)"
		duration: Int
		"Currency code"
		currency: String
		"Features included in the subscription"
		features: [FeatureInput!]
		"Status of the subscription"
		status: String!
		"ID of the user creating the subscription"
		createdById: ID!
		"ID of the user updating the subscription"
		updatedById: ID
	}

	input FeatureInput {
		"Unique key for the feature"
		featureKey: String!
		"Description of the feature"
		description: String!
		"Description when feature is not available"
		not_available_description: String
		"Whether the feature is available"
		available: Boolean
		"Limit for this feature (if applicable)"
		limit: String
		"Unit of measurement"
		unit: String
	}

	input SubscriptionWhereUpdateInput {
		"ID of the subscription to update or delete"
		id: ID!
	}

	input UpdateSubscriptionInput {
		"Name of the subscription plan"
		name: String
		"Plan code"
		planCode: String
		"Description of the subscription plan"
		description: String
		"Type of subscription"
		type: SubscriptionType
		"Price of the subscription"
		price: Float
		"Features included in the subscription"
		features: [FeatureInput!]
		"ID of the user updating the subscription"
		updatedById: ID
	}

	input SubscriptionFilterInput {
  		"Filter by type (subscription or addon)"
  		typeMatch: SubscriptionType
		"Search by name or plan code"
		subSearch: String
	}

	type SubscriptionResponse {
		"Status of the operation"
		status: Boolean!
		"Message describing the result"
		message: String!
		"The created subscription"
    	subscription: Subscription
	}

	type SubscriptionDeleteResponse {
  		"Status of the operation"
  		status: Boolean!
  		"Message describing the result"
  		message: String!
	}
`

export default subscriptionTypes