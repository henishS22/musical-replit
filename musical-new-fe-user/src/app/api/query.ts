import {
	COINFLOW_SESSION_KEY,
	CREATOR_QUEST,
	DOWNLOAD,
	FETCH_ROLE,
	GET_ALL_TOPICS,
	GET_AUDIENCE_INSIGHTS,
	GET_AYRSHARE_USER_INFO,
	GET_CAMPAIGN_INSIGHTS,
	GET_CHAT_TOKEN,
	GET_CITY_LIST,
	GET_COLLABORATION_ROLE,
	GET_COMMUNITY_FORUMS,
	GET_COUNTRY_CODES,
	GET_COUNTRY_LIST,
	GET_DESIGN_LIST,
	GET_FOLDERS_LIST,
	GET_GENRE_LIST,
	GET_INSTRUMENTS_LIST,
	GET_LANG,
	GET_NFT_PRIVATE_STREAMS,
	GET_NOTIFICATIONS,
	GET_POST_HISTORY,
	GET_PROJECT_LIST,
	GET_RELEASE_INSIGHTS,
	GET_SEARCH_REPORTS,
	GET_SKILLS_LEVELS,
	GET_STATE_LIST,
	GET_SUBSCRIPTION_ADDONS,
	GET_SUBSCRIPTION_DETAILS,
	GET_SUBSCRIPTION_FEATURE_AVAILABILITY,
	GET_SUBSCRIPTION_PLANS,
	GET_TAGS_LIST,
	GET_TOPIC_BY_ID,
	GET_TRACKS,
	GET_USER_CREATED_COLLABORATIONS,
	GET_USER_PROJECTS_BY_ID,
	LYRICS,
	MARK_ALL_AS_READ,
	NFT,
	PROJECT,
	SEARCH_FORUM_TOPICS,
	SONG_CONTEST,
	STREAM,
	TRACK,
	USERS
} from "@/constant/apiEndPoints"
import {
	GENRE_RESPONSE_ERROR,
	INSTRUMENT_RESPONSE_ERROR,
	TAGS_RESPONSE_ERROR
} from "@/constant/errorMessage"
import { apiRequest } from "@/helpers"
import { Genre, Instruments, Tag } from "@/types"
import {
	CollaborationPostData,
	ExchangeNftList,
	IApiResponseData,
	INft,
	StreamDetails,
	StreamSchema
} from "@/types/apiResponse"
import { Forum, Topic } from "@/types/communityTypes"
import {
	Design,
	fetchTrack,
	Language,
	SocialMediaPostHistory
} from "@/types/createOpportunityTypes"
import { ProjectResponse } from "@/types/dashboarApiTypes"
import { Quest } from "@/types/missionTypes"
import { AyrshareProfilesResponse } from "@/types/postToSocial"
import { Addon } from "@/types/subscription"

import { SubscriptionFeatureAvailability } from "@/stores/user"

interface ApiResponse<T> {
	data: T
}

interface CountryCodeResponse {
	data: Array<{
		name: string
		code: string
		dial_code: string
	}>
	error: boolean
	msg: string
}

interface ProjectQueryResponse {
	projects: ProjectResponse[]
	pagination: {
		total: number
		page: number
		limit: number
		pages: number
	}
}

interface StudioInstruments {
	_id: string
	icon: string
	instrument: string
}
interface ProjectTracksResponse {
	instrument: StudioInstruments[]
	tracks: IApiResponseData[]
	pagination: {
		totalCount: number
		page: number
		limit: number
		pages: number
	}
}

interface ExchangeNftListResponse {
	nfts: ExchangeNftList[]
	pagination: {
		total: number
		page: number
		pages: number
		limit: number
	}
}

interface NftListResponse {
	data: INft[]
	pagination: {
		total: number
		page: number
		pages: number
		limit: number
	}
}

type UserProfile = {
	name: string
	profile_img: string
	skills: string[] // Array of skill names
	styles: string[] // Array of style names or tags
	_id: string // Typically a MongoDB ObjectId string
}
interface LatestCreators {
	data: UserProfile[]
	pagination: {
		total: number
		page: number
		pages: number
		limit: number
	}
}

interface Duration {
	startFrom: string // ISO 8601 date string
	endTo: string // ISO 8601 date string
	_id: string // Unique identifier for the duration
}

interface User {
	_id: string // Unique identifier for the user
	name: string // User's name
	email: string // User's email
	profile_img: string | null // User's profile image URL or null
}

interface OpportunityListResponse {
	_id: string // Unique identifier for the response
	collaborateWith: string // Collaboration type
	userId: string // ID of the user
	projectId: string // ID of the project
	languages: string[] // Array of language IDs
	title: string // Title of the project
	tracks: string[] // Array of track IDs
	brief: string // Brief description
	seeking: string[] // Array of seeking IDs
	styles: string[] // Array of style IDs
	duration: Duration // Duration object
	createdAt: string // Creation date (ISO 8601)
	updatedAt: string // Update date (ISO 8601)
	__v: number // Version key
	user: User // User object
}

interface OpportunityResponse {
	result: OpportunityListResponse[]
	total: number
}

interface CollaborationPost {
	pagination: {
		total: number
		page: number
		limit: number
		pages: number
	}
	collaborations: CollaborationPostData[]
}

type Response = {
	_id?: string
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[key: string]: any // Allow additional properties
}

const fetchUserData = async (id: string) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const res: any = await apiRequest({
		url: `${USERS}/${id}`,
		method: "GET"
	})
	return res.data
}

const fetchRecentTrack = async (payload: string) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const res: any = await apiRequest({
		url: `${GET_TRACKS}${payload}`,
		method: "GET"
	})
	return res.data
}

const fetchUserProjects = async (payload: string) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const res: any = await apiRequest({
		url: `${GET_USER_PROJECTS_BY_ID}${payload}`,
		method: "GET"
	})
	return res.data
}

const fetchSearchReposts = async (payload: string) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const res: any = await apiRequest({
		url: `${GET_SEARCH_REPORTS}?${payload}`,
		method: "GET"
	})
	return res.data
}

const fetchRoles = async (lang: string) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const res: any = await apiRequest({
		url: `${FETCH_ROLE}/${lang}`,
		method: "GET"
	})
	return res.data
}

const fetchUserList = async (payload: string) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const res: any = await apiRequest({
		url: `${USERS}${payload}`,
		method: "GET"
	})
	return res.data
}
const fetchFoldersList = async () => {
	return await apiRequest({
		url: GET_FOLDERS_LIST,
		method: "GET"
	})
}

const fetchProjectList = async (userId: string, param: string) => {
	const response = await apiRequest<ApiResponse<ProjectQueryResponse>>({
		url: `${GET_PROJECT_LIST}/${userId}${param}`,
		method: "GET"
	})

	return response?.data
}

const fetchGenre = async (lang: string) => {
	const response = await apiRequest<ApiResponse<Genre[]>>({
		url: `${GET_GENRE_LIST}/${lang}`,
		method: "GET"
	})

	if (!response) {
		throw new Error(GENRE_RESPONSE_ERROR)
	}

	return response.data
}

const fetchInstruments = async (lang: string) => {
	const response = await apiRequest<ApiResponse<Instruments[]>>({
		url: `${GET_INSTRUMENTS_LIST}/${lang}`,
		method: "GET"
	})
	if (!response) {
		throw new Error(INSTRUMENT_RESPONSE_ERROR)
	}

	return response.data
}

const fetchTags = async (lang: string) => {
	const response = await apiRequest<ApiResponse<Tag[]>>({
		url: `${GET_TAGS_LIST}/${lang}`,
		method: "GET"
	})
	if (!response) {
		throw new Error(TAGS_RESPONSE_ERROR)
	}

	return response.data
}

const fetchTrackDetails = async (id: string) => {
	const response = await apiRequest<ApiResponse<fetchTrack>>({
		url: `${TRACK}/${id}`,
		method: "GET"
	})
	return response?.data
}
const downloadTrack = async (
	id: string,
	name: string,
	extension: string
): Promise<void> => {
	try {
		const response = await apiRequest<Blob>({
			url: `${TRACK}/${id}/${DOWNLOAD}`,
			method: "GET",
			responseType: "blob"
		})

		if (!response || !(response instanceof Blob)) {
			throw new Error("Invalid response format - expected blob data")
		}

		// Create blob URL
		const blobUrl = window.URL.createObjectURL(response)

		try {
			// Create temporary link and trigger download
			const downloadLink = document.createElement("a")
			downloadLink.href = blobUrl
			downloadLink.download = `${name}.${extension}`
			document.body.appendChild(downloadLink)
			downloadLink.click()

			// Small timeout to ensure download starts before cleanup
			await new Promise((resolve) => setTimeout(resolve, 100))
		} finally {
			// Always cleanup the blob URL
			window.URL.revokeObjectURL(blobUrl)
		}
	} catch (error) {
		console.error("Download failed:", error)
		throw new Error(
			error instanceof Error ? error.message : "Failed to download track"
		)
	}
}
const fetchSocialMediaPostHistory = async (queryParams?: string) => {
	try {
		const url = queryParams
			? `${GET_POST_HISTORY}?${encodeURIComponent(queryParams)}`
			: GET_POST_HISTORY

		const response = await apiRequest<ApiResponse<SocialMediaPostHistory>>({
			url,
			method: "GET"
		})

		if (!response) {
			throw new Error("Failed to fetch social media post history")
		}

		return response.data
	} catch (error) {
		console.error("Error fetching social media post history:", error)
		throw error
	}
}
const fetchProject = async (projectId: string) => {
	const response = await apiRequest<ApiResponse<ProjectResponse>>({
		url: `${PROJECT}/${projectId}`,
		method: "GET"
	})
	return response?.data
}

const fetchLang = async () => {
	const response = await apiRequest<ApiResponse<Language[]>>({
		url: `${GET_LANG}`,
		method: "GET"
	})
	return response?.data
}

const fetchCountryCodes = async () => {
	const response = await apiRequest<CountryCodeResponse>({
		baseUrl: process.env.NEXT_PUBLIC_COUNTRY_CODES,
		url: GET_COUNTRY_CODES,
		method: "GET"
	})
	return response?.data
}

const fetchProjectTracks = async (projectId: string, query: string) => {
	const response = await apiRequest<ApiResponse<ProjectTracksResponse>>({
		url: `${PROJECT}/getTracksByProjectId/${projectId}${query}`,
		method: "GET"
	})
	return response?.data
}

const fetchOpportunityList = async (userId: string, url: string) => {
	const response = await apiRequest<ApiResponse<OpportunityResponse>>({
		url: `song-contest/${userId}/get-all-song-contest${url}`,
		method: "GET"
	})
	return response?.data
}

const fetchSavedSongContestIds = async () => {
	const response = await apiRequest<ApiResponse<string[]>>({
		url: `${SONG_CONTEST}/get-saved-song-contest-ids`,
		method: "GET"
	})
	return response?.data
}

const fetchSongContest = async (id: string) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${SONG_CONTEST}/get-song-contest/${id}`,
		method: "GET"
	})
	return response?.data[0]
}

const fetchApplicationsByProjectId = async (projectId: string) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${SONG_CONTEST}/get-applications-by-project-id/${projectId}`,
		method: "GET"
	})
	return response?.data
}

const fetchApplicationsBySongContestId = async (songContestId: string) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${SONG_CONTEST}/get-applications/${songContestId}`,
		method: "GET"
	})
	return response?.data
}

const fetchUsedProject = async () => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${SONG_CONTEST}/used-projects`,
		method: "GET"
	})
	return response?.data
}

const fetchTrackComments = async (trackId: string) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${TRACK}/get-track-comment?track_comment_id=${trackId}`,
		method: "GET"
	})
	return response?.data
}

const fetchChatToken = async () => {
	const response = await apiRequest<ApiResponse<string>>({
		url: GET_CHAT_TOKEN,
		method: "GET"
	})
	return response?.data
}

const fetchCountryList = async () => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: GET_COUNTRY_LIST,
		method: "GET"
	})
	return response?.data
}

const fetchStateList = async (countryId: string) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${GET_STATE_LIST}/${countryId}/states`,
		method: "GET"
	})
	return response?.data
}

const fetchCityList = async (stateId: string) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${GET_CITY_LIST}/${stateId}/cities`,
		method: "GET"
	})
	return response?.data
}

const fetchLocalization = async (userId: string) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${USERS}/${userId}/localization`,
		method: "GET"
	})
	return response?.data
}

const fetchUserSkills = async (userId: string) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${GET_INSTRUMENTS_LIST}/${userId}`,
		method: "GET"
	})
	return response?.data
}

const fetchUserSkillsLevels = async (userId: string) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${GET_SKILLS_LEVELS}/${userId}`,
		method: "GET"
	})
	return response?.data
}

const fetchDesigns = async () => {
	const response = await apiRequest<ApiResponse<Design[]>>({
		url: GET_DESIGN_LIST,
		method: "GET"
	})
	return response?.data
}

const ayrshareUserInfo = async () => {
	const response = await apiRequest<ApiResponse<AyrshareProfilesResponse>>({
		url: GET_AYRSHARE_USER_INFO,
		method: "GET"
	})
	return response?.data
}

const fetchForums = async () => {
	const response = await apiRequest<ApiResponse<Forum[]>>({
		url: GET_COMMUNITY_FORUMS,
		method: "GET"
	})
	return response?.data
}

const fetchAllTopics = async () => {
	const response = await apiRequest<ApiResponse<Topic[]>>({
		url: GET_ALL_TOPICS,
		method: "GET"
	})
	return response?.data
}

const fetchTopicById = async (id: string) => {
	const response = await apiRequest<ApiResponse<Topic>>({
		url: `${GET_TOPIC_BY_ID}${id}`,
		method: "GET"
	})
	return response?.data
}

const fetchCreatedCollaborations = async (id: string, lang: string) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `users/${id}/${GET_USER_CREATED_COLLABORATIONS}/${lang}`,
		method: "GET"
	})
	return response?.data
}

const fetchArtists = async (url: string) => {
	const response = await apiRequest<ApiResponse<LatestCreators>>({
		url: `${USERS}/artists/search${url}`,
		method: "GET"
	})
	return response?.data
}

const fetchNfts = async (url: string) => {
	const response = await apiRequest<ApiResponse<NftListResponse>>({
		url: `${NFT}${url}`,
		method: "GET"
	})
	return response?.data
}

const fetchNftsCoinMarketCap = async () => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${NFT}/coinMarketCap`,
		method: "GET"
	})
	return response?.data
}

const fetchNftsById = async (nftId: string, queryParams?: string) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${NFT}/getNftsById/${nftId}${queryParams}`,
		method: "GET"
	})
	return response?.data
}

const fetchNftDetails = async (
	nftId: string,
	projectId: string,
	url: string
) => {
	const response = await apiRequest<ApiResponse<ProjectTracksResponse>>({
		url: `${NFT}/${nftId}/projectTracks/${projectId}${url}`,
		method: "GET"
	})
	return response?.data
}

const fetchSearchForumTopics = async (query: string) => {
	const response = await apiRequest<ApiResponse<Topic[]>>({
		url: `${SEARCH_FORUM_TOPICS}${query}`,
		method: "GET"
	})
	return response?.data
}

const fetchNotifications = async (param: string) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${GET_NOTIFICATIONS}${param}`,
		method: "GET"
	})
	return response?.data
}

const markAllNotificationsAsRead = async () => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${MARK_ALL_AS_READ}`,
		method: "POST"
	})
	return response?.data
}

const fetchNftsByUser = async () => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${NFT}/getNftsByUser`,
		method: "GET"
	})
	return response?.data
}

const fetchSubscriptionsPlans = async () => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: GET_SUBSCRIPTION_PLANS,
		method: "GET"
	})

	return response?.data
}
const fetchSubscriptionsAddons = async () => {
	const response = await apiRequest<ApiResponse<Addon[]>>({
		url: GET_SUBSCRIPTION_ADDONS,
		method: "GET"
	})
	return response?.data
}

const fetchExchangeNfts = async (url: string) => {
	const response = await apiRequest<ApiResponse<ExchangeNftListResponse>>({
		url: `${NFT}/getExchangeNfts${url}`,
		method: "GET"
	})
	return response?.data
}

const fetchExchangeNft = async (exchangeNftId: string) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${NFT}/getExchangeNft?exchangeNftId=${exchangeNftId}`,
		method: "GET"
	})
	return response?.data
}

const fetchRequestedExchangeNfts = async (queryParams: string) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${NFT}/getRequestedExchangeNfts${queryParams}`,
		method: "GET"
	})
	return response?.data
}

const fetchPublicProjects = async (queryParams: string = "") => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${PROJECT}/public${queryParams}`,
		method: "GET"
	})
	return response?.data
}

const fetchUserNftStats = async () => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${NFT}/getUserNftStats`,
		method: "GET"
	})
	return response?.data
}

const fetchSubscriptionDetails = async (subscriptionId: string) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${GET_SUBSCRIPTION_DETAILS}/${subscriptionId}`,
		method: "GET"
	})
	return response?.data
}

const fetchTrackMetadata = async (trackId: string) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `/metadata/get/${trackId}`,
		method: "GET"
	})
	return response?.data
}

const fetchMessages = async (platform: string, queryParams?: string) => {
	const url = queryParams
		? `/messages/${platform === "x" ? "twitter" : platform}?${queryParams}`
		: `/messages/${platform === "x" ? "twitter" : platform}`

	const response = await apiRequest<ApiResponse<Response>>({
		url,
		method: "GET"
	})
	return response?.data
}

const fetchStreamDetails = async (streamId: string) => {
	const response = await apiRequest<ApiResponse<StreamDetails>>({
		url: `/stream/${streamId}`,
		method: "GET"
	})
	return response?.data
}

const fetchPublicStream = async () => {
	const response = await apiRequest<ApiResponse<StreamSchema[]>>({
		url: `/stream/public`,
		method: "GET"
	})
	return response?.data
}

const fetchToBeHostedStream = async () => {
	const response = await apiRequest<ApiResponse<StreamSchema[]>>({
		url: `/stream/hosted`,
		method: "GET"
	})
	return response?.data
}

const fetchLyrics = async (id: string) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${LYRICS}/${id}`,
		method: "GET"
	})
	return response?.data
}

interface Stream {
	_id: string
	title: string
	description: string
	type: string
	accessControl: string
	artworkUrl: string
	scheduleDate: string
	streamId: string
	createdById: string
	nftIds: string[]
	status: string
	createdAt: string
	updatedAt: string
	__v: number
}

interface Pagination {
	total: number
	page: number
	limit: number
	totalPages: number
}

interface StreamResponse {
	data: Stream[]
	pagination: Pagination
}

const fetchNftPrivateStreams = async (
	nftId: string,
	page: number = 1,
	limit: number = 20
) => {
	const response = await apiRequest<ApiResponse<StreamResponse>>({
		url: `${GET_NFT_PRIVATE_STREAMS(nftId)}?page=${page}&limit=${limit}&streamSchedule=upcoming`,
		method: "GET"
	})
	return response?.data
}

const fetchStreamNftHolders = async (streamId: string) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${STREAM}/${streamId}/nft-holders`,
		method: "GET"
	})
	return response?.data
}

const fetchCreateCollaborationsList = async (
	userId: string,
	queryParams?: string
) => {
	const response = await apiRequest<ApiResponse<CollaborationPost>>({
		url: `${SONG_CONTEST}/create-collaborations-list/${userId}${queryParams}`,
		method: "GET"
	})

	return response?.data
}

const fetchAppliedCollaborationsList = async (queryParams?: string) => {
	const response = await apiRequest<ApiResponse<CollaborationPost>>({
		url: `${SONG_CONTEST}/applied-collaborations-list${queryParams}`,
		method: "GET"
	})
	return response?.data
}

const fetchChatBot = async (
	payload: Record<string, string | number | boolean | object>
) => {
	const response = await apiRequest<{ assistant_response: string }>({
		url: `/chat`,
		method: "POST",
		baseUrl: process.env.NEXT_PUBLIC_CHAT_BOT_BASE_URL,
		payload
	})
	return response?.assistant_response
}

const fetchCollaborationRole = async (lang: string) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${GET_COLLABORATION_ROLE}/${lang}`,
		method: "GET"
	})
	return response?.data
}

const fetchSubscriptionFeatureAvailability = async () => {
	const response = await apiRequest<
		ApiResponse<SubscriptionFeatureAvailability[]>
	>({
		url: GET_SUBSCRIPTION_FEATURE_AVAILABILITY,
		method: "GET"
	})
	return response?.data
}

const fetchCampaignInsights = async () => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: GET_CAMPAIGN_INSIGHTS,
		method: "GET"
	})
	return response?.data
}

const fetchReleaseInsights = async () => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: GET_RELEASE_INSIGHTS,
		method: "GET"
	})
	return response?.data
}

const fetchAudienceInsights = async () => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: GET_AUDIENCE_INSIGHTS,
		method: "GET"
	})
	return response?.data
}

const fetchCoinflowSessionToken = async () => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: COINFLOW_SESSION_KEY,
		method: "GET"
	})
	return response?.data
}

const fetchPlatformQuest = async () => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `/creator-quest/admin-quest`,
		method: "GET"
	})
	return response?.data
}
const fetchPublishableQuest = async () => {
	const response = await apiRequest<ApiResponse<Quest[]>>({
		url: `/creator-quest/admin-quest-by-user`,
		method: "GET"
	})
	return response?.data
}

const fetchMarketQuest = async (url: string) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `/creator-quest/platform-quest${url}`,
		method: "GET"
	})
	return response?.data
}

const fetchPublishedQuest = async () => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `/creator-quest/creator-quest`,
		method: "GET"
	})
	return response?.data
}
export interface LeaderboardParams {
	page: number
	limit: number
}

export interface LeaderboardItem {
	totalPoints: number
	totalOccurrence: number
	userId: string
	username: string
	email: string
	profile_img: string
}

export interface LeaderboardResponse {
	data: LeaderboardItem[]
	total: number
	totalPages: number
}

export const getCreatorQuestLeaderboard = async (params: LeaderboardParams) => {
	const { page, limit } = params
	const response = await apiRequest<ApiResponse<LeaderboardResponse>>({
		url: `${CREATOR_QUEST}/leaderboard?page=${page}&limit=${limit}`,
		method: "GET"
	})
	return response?.data
}

const fetchPlatformQuestHistory = async (url: string) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `/user-activity/getEvents${url}`,
		method: "GET"
	})
	return response?.data
}

const fetchExternalQuestHistory = async (url: string) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `/creator-quest/history${url}`,
		method: "GET"
	})
	return response?.data
}

const fetchUserQuest = async (url: string) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `/user-activity/getEvents${url}`,
		method: "GET"
	})
	return response?.data
}

const fetchCreatorQuest = async (id: string) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `/creator-quest/creator-quest-list?userId=${id}`,
		method: "GET"
	})
	return response?.data
}

const fetchCreatorQuestDetails = async (id: string) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${CREATOR_QUEST}/details?creatorQuestId=${id}`,
		method: "GET"
	})
	return response?.data
}

const fetchCreatorLeaderboard = async (params: LeaderboardParams) => {
	const { page, limit } = params
	const response = await apiRequest<ApiResponse<LeaderboardResponse>>({
		url: `${CREATOR_QUEST}/quest-leaderboard?page=${page}&limit=${limit}`,
		method: "GET"
	})
	return response?.data
}

export {
	fetchUserData,
	fetchRecentTrack,
	fetchUserProjects,
	fetchSearchReposts,
	fetchRoles,
	fetchUserList,
	fetchFoldersList,
	fetchProjectList,
	fetchGenre,
	fetchInstruments,
	fetchTags,
	fetchTrackDetails,
	fetchProject,
	downloadTrack,
	fetchLang,
	fetchCountryCodes,
	fetchProjectTracks,
	fetchOpportunityList,
	fetchSocialMediaPostHistory,
	fetchSavedSongContestIds,
	fetchSongContest,
	fetchApplicationsByProjectId,
	fetchApplicationsBySongContestId,
	fetchUsedProject,
	fetchTrackComments,
	fetchChatToken,
	fetchDesigns,
	fetchCountryList,
	fetchStateList,
	fetchCityList,
	fetchLocalization,
	fetchUserSkills,
	fetchUserSkillsLevels,
	ayrshareUserInfo,
	fetchForums,
	fetchAllTopics,
	fetchTopicById,
	fetchCreatedCollaborations,
	fetchNotifications,
	markAllNotificationsAsRead,
	fetchArtists,
	fetchNfts,
	fetchNftsCoinMarketCap,
	fetchNftsById,
	fetchNftDetails,
	fetchSearchForumTopics,
	fetchNftsByUser,
	fetchSubscriptionsPlans,
	fetchSubscriptionsAddons,
	fetchExchangeNfts,
	fetchExchangeNft,
	fetchRequestedExchangeNfts,
	fetchPublicProjects,
	fetchUserNftStats,
	fetchTrackMetadata,
	fetchMessages,
	fetchStreamDetails,
	fetchPublicStream,
	fetchToBeHostedStream,
	fetchSubscriptionDetails,
	fetchNftPrivateStreams,
	fetchStreamNftHolders,
	fetchCreateCollaborationsList,
	fetchAppliedCollaborationsList,
	fetchChatBot,
	fetchCollaborationRole,
	fetchSubscriptionFeatureAvailability,
	fetchCampaignInsights,
	fetchReleaseInsights,
	fetchLyrics,
	fetchCoinflowSessionToken,
	fetchPublishableQuest,
	fetchMarketQuest,
	fetchPublishedQuest,
	fetchAudienceInsights,
	fetchPlatformQuest,
	fetchPlatformQuestHistory,
	fetchExternalQuestHistory,
	fetchUserQuest,
	fetchCreatorQuest,
	fetchCreatorLeaderboard,
	fetchCreatorQuestDetails
}



// Guilded NFTs API
export const fetchGuildedNfts = async (queryParams = "") => {
	const response = await apiRequest<ApiResponse<NftListResponse>>({
		url: `/guilded-nft/${queryParams}`,
		method: "GET"
	})
	return response?.data
}

export const fetchGuildedNftById = async (nftId: string) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `/guilded-nft/getGuildedNftsById/${nftId}`,
		method: "GET"
	})
	return response?.data
}

export const fetchReListedNfts = async (queryParams = "") => {
	const response = await apiRequest<ApiResponse<NftListResponse>>({
		url: `/guilded-nft/relisted-nfts${queryParams}`,
		method: "GET"
	})
	return response?.data
}
