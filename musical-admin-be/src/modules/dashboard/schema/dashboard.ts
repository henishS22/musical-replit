import { gql } from 'apollo-server-express'

const dashboardTypes = gql`
	type Query {
		"A dashboard details"
		dashboard: DashboardResponse!
	}

	type Mutation {
		"Graph details for the trading history"
		graph(input: graphInput!): GraphResponse!

		"User Graph details for the user history"
		userGraph(input: userGraphInput!): UserGraphResponse!
		"nft Sell Graph details for the user history"
		sellNftGraph(input: sellNftGraphInput!): SellNftGraphResponse!
	}

	type DashboardResponse {
		message: String!
		status: String!
		userdata:Float
		projectData:Float
		trackData:Float
		subscription :Float
		ipfsStorage :Float
		dropboxStorage :Float
		driveStorage :Float
		totalPoint:Float
	}

	type DashboardData {
		"Total count on the system"
		totalCount: Float
		"Total increased percentage in last 24 hours"
		countIncreased: Float
	}

	type GraphResponse {
		"Response Message in string for success or failure."
		message: String!
		"Status of the response in boolean for success or failure."
		status: String!
		"Graph data for last 12 months trading history"
		graphdata: [graphObj]
	}
	type graphObj {
		chainNumber: Int
		arrMonth: MonthData
	}
	type MonthData {
		data1: GraphData
		data2: GraphData
		data3: GraphData
		data4: GraphData
		data5: GraphData
		data6: GraphData
		data7: GraphData
		data8: GraphData
		data9: GraphData
		data10: GraphData
		data11: GraphData
		data12: GraphData
		data13: GraphData
		data14: GraphData
		data15: GraphData
		data16: GraphData
		data17: GraphData
		data18: GraphData
		data19: GraphData
		data20: GraphData
		data21: GraphData
		data22: GraphData
		data23: GraphData
		data24: GraphData
		data25: GraphData
		data26: GraphData
		data27: GraphData
		data28: GraphData
		data29: GraphData
		data30: GraphData
		data31: GraphData
	}
	type GraphData {
		value: Float
		datetime: String
	}

	input graphInput {
		"Interval the graph data to be fetched for graph "
		interval: intervalInput!
	}

	enum intervalInput {
		"Fetch daily data"
		daily
		"Fetch weekly data"
		weekly
		"Fetch monthly data"
		monthly
		"Fetch yearly data"
		yearly
	}

	input userGraphInput {
		"Interval the graph data to be fetched for graph "
		interval: intervalInput!
	}

	type UserGraphResponse {
		"Response Message in string for success or failure."
		message: String!
		"Status of the response in boolean for success or failure."
		status: String!
		"Graph data for count user registered"
		userGraphdata: [userGraphObj]
	}

	type userGraphObj {
		arrMonth: MonthData
	}

	input sellNftGraphInput {
		"Interval the graph data to be fetched for graph"
		interval: intervalInput!
	}

	type SellNftGraphResponse {
		"Response Message in string for success or failure."
		message: String!
		"Status of the response in boolean for success or failure."
		status: String!
		"Graph data for count sell nft period wise"
		sellNftGraphdata: [sellNftGraphObj]
	}

	type sellNftGraphObj {
		arrMonth: MonthData
	}
`
export default dashboardTypes
