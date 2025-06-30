import { gql } from 'apollo-server-express'

const metadataTypes = gql`
	type Query {
		"A list of roles"
		releaseList(
			after: String
			before: String
			first: Int
			last: Int
			orderBy: ReleaseOrderByInput!
			filters: ReleaseWhereInput
		): ReleaseConnection!

		"A role details"
		release(id: String!): Release!
	}
		
	type Release {
		id: ID
		userId: ID
		projectId: ID
		isSendForRelease: Boolean
		track: Track
		artist: Artist
		collaborators: [CollaboratorData]
		trackMetadata: TrackMetadata
		ownership: Ownership
		compositionRights: [CompositionRight]
		releaseStatus: ReleaseStatus
		createdAt: String
		updatedAt: String
		trackId: TrackData
	}

	type TrackData {
		id:ID
		name:String
		extension:String
		size:Float
		duration:Float
		imageWaveBig:String
		imageWaveSmall:String
		metadata_id:ID
		createdAt:Date
		updatedAt:Date
	}


	type CollaboratorData {
			userName:String
			userImage:String
			splitValue:String
			walletAddress:String
			id:ID
	}

	type Track {
		artist: String
		language: ID
		trackId: ID
	}

	type Artist {
		performerCredit: String
		writeCredit: String
		additionalCredit: String
		role: String
		genre: [ID]
	}

	type TrackMetadata {
		labelName: String
		copyrightName: String
		copyrightYear: Int
		countryOfRecording: String
		trackISRC: String
		lyrics: String
	}

	type Ownership {
		ownership: Boolean
		territories: String
	}

	type CompositionRight {
		composerName: String
		percentageOfOwnership: Float
		rightsManagement: String
	}

	type ReleaseStatus {
		previouslyReleased: Boolean
		upc: String
		releaseDate: String
	}

	type ReleaseEdge {
		"A cursor for use in pagination."
		cursor: ID!
		"A post at the end of an edge."
		node: Release
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

	type ReleaseConnection {
		"A list of post edges."
		edges: [ReleaseEdge]
		"Information to assist with pagination."
		pageInfo: PageInfo!
	}

	type messageResponse {
		"Response Message in string for success or failure."
		message: String!
		"Status of the response in boolean for success or failure."
		status: String!
	}

	enum ReleaseOrderByInput {
		"Order role ascending by creation time."
		createdAt_ASC
		"Order role decending by creation time."
		createdAt_DESC
		"Order role ascending by name."
		name_ASC
		"Order role ascending by name."
		name_DESC
	}

	input ReleaseWhereInput {
		searchDistro:String
		statusMatch:String
	}
`

export default metadataTypes
