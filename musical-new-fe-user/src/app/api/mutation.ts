import { ProfileFormValues } from "@/components/profile/editProfile/PersonalInfo"
import { StyleAndSkillsPayload } from "@/components/profile/editProfile/StyleAndSkills"
import {
	ADD_COMMENT_TO_TOPIC,
	ADD_TRACKS_TO_PROJECT,
	ADD_WALLET,
	CHECK_EMAIL,
	COLLABORATIONS_OPPORTUNITIES,
	CREATE,
	CREATE_COMMUNITY_TOPIC,
	CREATE_LIVESTREAM,
	CREATOR_QUEST,
	DELETE_TOPIC,
	DISTRO,
	FOLDERS,
	GCP_DELETE_API,
	GENERATE_AUDIO,
	GENRATE_MEDIA,
	GET_AYRSHARE_JWT,
	GET_MEDIA_CONTENT,
	GET_MEDIA_LIST,
	GOOGLE_LOGIN,
	LYRICS,
	MARK_AS_READ,
	METADATA,
	NFT,
	OTP_SEND,
	POST_TO_SOCIAL_MEDIA,
	PROJECT,
	RESET_PASSWORD,
	SCRAPPER,
	SEND_INVITE,
	SEND_SMS_INVITE,
	SENTIMENT_ANALYSIS,
	SONG_CONTEST,
	STREAM,
	TRACK,
	UPDATE_AI,
	UPDATE_COMMUNITY_TOPIC,
	UPLOAD_MEDIA,
	USERS,
	USERS_ADD_FCM_TOKEN,
	USERS_CONFIRM,
	USERS_VALIDATE,
	VERIFY_GOOGLE_LOGIN
} from "@/constant/apiEndPoints"
import {
	FAILED_TO_GENERATE_AUDIO,
	FAILED_TO_GENERATE_VIDEO
} from "@/constant/errorMessage"
import { apiRequest } from "@/helpers"
import { FolderMovePayload, loginUsingCreds } from "@/types"
import { CreateOpportunityPayload } from "@/types/createOpportunityTypes"
import { CheckEmailResponse } from "@/types/dashboarApiTypes"
import { CreatorQuestPayload } from "@/types/missionTypes"
import {
	AyrshareJwtResponse,
	SocialMediaPostPayload
} from "@/types/postToSocial"

import { mediaTypeMap } from "@/config/generatemedia"
import { LoginResponse } from "@/stores/user"

interface ApiResponse<T> {
	data: T
}

type Response = {
	_id?: string
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[key: string]: any // Allow additional properties
}

interface GoogleAuthResponse {
	message: string
	item: {
		googleAuthURL: string
	}
}

interface SignInResponse {
	message: string
	items: {
		accessToken: string
		userId: string
	}
}

export type InitateTrackCommentPayload = {
	track_id: string | number
	duration: {
		from: number
		to: number
	}
	comment: string
}

const createUser = async (
	payload: Record<string, string | number | object>
) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: USERS,
		method: "POST",
		payload
	})

	return response?.data
}

const addFCMToken = async (payload: Record<string, string>) => {
	return await apiRequest({
		url: `${USERS_ADD_FCM_TOKEN}`,
		method: "POST",
		payload
	})
}

const validateToken = async (payload: string) => {
	return await apiRequest({
		url: `${USERS_CONFIRM}/${payload}`,
		method: "POST"
	})
}

export const createTrackWithOwner = async (
	payload: FormData,
	userId: string
) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `/tracks?owner=${userId}`,
		method: "POST",
		payload
	})
	return response?.data
}

const createTrack = async (payload: FormData) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: TRACK,
		method: "POST",
		payload
	})
	return response?.data
}

const createProject = async (payload: FormData) => {
	return await apiRequest<ApiResponse<Response>>({
		url: PROJECT,
		method: "POST",
		payload
	})
}

const createFolder = async (
	payload: Record<string, string | number | object>
) => {
	return await apiRequest({
		url: FOLDERS,
		method: "POST",
		payload
	})
}

const UpdateFolder = async ({
	payload,
	method
}: {
	payload: Record<string, string | number | object>
	method: "DELETE" | "PUT"
}) => {
	return await apiRequest({
		url: `${FOLDERS}/${payload.id}`,
		method: method,
		payload
	})
}

const FetchMediaList = async ({
	payload
}: {
	payload: Record<string, string | number | object>
}) => {
	return await apiRequest({
		url: GET_MEDIA_LIST,
		method: "POST",
		payload
	})
}

const FetchMediaContent = async ({
	payload
}: {
	payload: Record<string, string | number | object>
}) => {
	return await apiRequest({
		url: GET_MEDIA_CONTENT,
		method: "POST",
		payload
	})
}

const resetPassword = async (
	payload: Record<string, string | number | object>,
	method: "POST" | "PATCH"
) => {
	return await apiRequest({
		url: RESET_PASSWORD,
		method,
		payload
	})
}

const checkEmail = async (payload: { email: string }) => {
	const response = await apiRequest<ApiResponse<CheckEmailResponse>>({
		url: CHECK_EMAIL,
		method: "POST",
		payload
	})

	return response?.data
}

const sendInvite = async (payload: {
	email: string
	type: string
	projectName?: string
}) => {
	const response = await apiRequest<ApiResponse<string>>({
		url: SEND_INVITE,
		method: "POST",
		payload
	})
	return response?.data
}

const sendSmsInvite = async (
	payload: Record<"phoneNumber" | "countryCode" | "type", string>
) => {
	const response = await apiRequest<ApiResponse<Record<string, string>>>({
		url: SEND_SMS_INVITE,
		method: "POST",
		payload
	})
	return response?.data
}

const updateProjectCollaborators = async (
	projectId: string,
	payload: Record<string, string | number | object>
) => {
	const response = await apiRequest<ApiResponse<unknown>>({
		url: `/projects/${projectId}/collaborators`,
		method: "PUT",
		payload
	})
	return response?.data
}
const updateTrack = async (
	id: string,
	payload: FormData | FolderMovePayload
) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${TRACK}/${id}`,
		method: "PUT",
		payload
	})
	return response?.data
}

const deleteTrack = async (id: string) => {
	const response = await apiRequest<ApiResponse<string>>({
		url: `${TRACK}/${id}`,
		method: "DELETE"
	})
	return response?.data
}
const login = async (payload: loginUsingCreds) => {
	const response = await apiRequest<ApiResponse<LoginResponse>>({
		url: USERS_VALIDATE,
		method: "POST",
		payload
	})
	return response?.data
}

const socialLogin = async () => {
	const response = await apiRequest<ApiResponse<GoogleAuthResponse>>({
		url: `${GOOGLE_LOGIN}?redirect_uri=${process.env.NEXT_PUBLIC_DEVELOPMENT_URL}/login`,
		method: "GET"
	})
	return response?.data?.item?.googleAuthURL
}

const verifyGoogleLogin = async (payload: Record<string, string>) => {
	const response = await apiRequest<ApiResponse<SignInResponse>>({
		url: VERIFY_GOOGLE_LOGIN,
		method: "POST",
		payload
	})
	return response?.data?.items
}

const CollaborationsOpportunites = async (
	payload: CreateOpportunityPayload
) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: COLLABORATIONS_OPPORTUNITIES,
		method: "POST",
		payload
	})
	return response?.data
}

const addWallet = async (payload: Record<string, string>) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: ADD_WALLET,
		method: "POST",
		payload
	})
	return response?.data
}

const addTracksToProject = async (payload: {
	projectId: string
	trackIds: string[]
}) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${ADD_TRACKS_TO_PROJECT}${payload?.projectId}`,
		method: "POST",
		payload: {
			trackIds: payload?.trackIds
		}
	})
	return response?.data
}

const deleteProject = async (projectId: string) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${PROJECT}/${projectId}`,
		method: "DELETE"
	})
	return response?.data
}

const updateProject = async (projectId: string, payload: FormData) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${PROJECT}/${projectId}`,
		method: "PUT",
		payload
	})
	return response?.data
}

const saveSongContest = async (payload: Record<string, string>) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${SONG_CONTEST}/save-song-contest`,
		method: "POST",
		payload
	})
	return response?.data
}

const deleteSavedSongContest = async (songContestId: string) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${SONG_CONTEST}/delete-saved-song-contest/${songContestId}`,
		method: "DELETE"
	})
	return response?.data
}

const applySongContest = async (payload: Record<string, string | string[]>) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${SONG_CONTEST}/apply-song-contest`,
		method: "POST",
		payload
	})
	return response?.data
}

const updateApplicationStatus = async (
	id: string,
	payload: Record<string, boolean | string>
) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${SONG_CONTEST}/update-application-status/${id}`,
		method: "PUT",
		payload
	})
	return response?.data
}

const generateMedia = async (payload: FormData, mediaType: string) => {
	const response = await apiRequest<ArrayBuffer>({
		baseUrl: process.env.NEXT_PUBLIC_AI_URL,
		url: `${GENRATE_MEDIA}`,
		method: "POST",
		payload,
		responseType: "arraybuffer"
	})
	if (!response) {
		throw new Error(FAILED_TO_GENERATE_VIDEO)
	}
	const blob = new Blob([response], {
		type: mediaTypeMap[mediaType as keyof typeof mediaTypeMap]
	})
	const url = URL.createObjectURL(blob)
	const file = new File([blob], "generated-media", {
		type: mediaTypeMap[mediaType as keyof typeof mediaTypeMap]
	})
	return { url, file }
}

const generateAudio = async (payload: FormData) => {
	const response = await apiRequest<ArrayBuffer>({
		baseUrl: process.env.NEXT_PUBLIC_AUDIO_AI_URL,
		url: `${GENERATE_AUDIO}`,
		method: "POST",
		payload,
		responseType: "arraybuffer"
	})
	if (!response) {
		throw new Error(FAILED_TO_GENERATE_AUDIO)
	}
	const blob = new Blob([response], { type: "audio/wav" })
	const url = URL.createObjectURL(blob)
	const file = new File([blob], "generated-audio.wav", { type: "audio/wav" })
	return { url, file }
}

const initateTrackComment = async (payload: InitateTrackCommentPayload) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${TRACK}/initiate-comment`,
		method: "POST",
		payload
	})
	return response?.data
}

const addComment = async (payload: Record<string, string>) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${TRACK}/add-comment`,
		method: "POST",
		payload
	})
	return response?.data
}

const deleteComment = async (payload: Record<string, string>) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${TRACK}/delete-comment`,
		method: "POST",
		payload
	})
	return response?.data
}

const markAsResolvedComment = async (payload: Record<string, string>) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${TRACK}/mark-as-resolve-comment`,
		method: "POST",
		payload
	})
	return response?.data
}

const deleteTrackFromProject = async (trackId: string, projectId: string) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${TRACK}/${trackId}/projects/${projectId}`,
		method: "DELETE"
	})
	return response?.data
}

const createChannel = async (payload: Record<string, string | string[]>) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `/chat/channel`,
		method: "POST",
		payload
	})
	return response?.data
}

const posttoSocialMedia = async (payload: SocialMediaPostPayload) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${POST_TO_SOCIAL_MEDIA}`,
		method: "POST",
		payload
	})
	return response?.data
}

const updateWithAi = async (payload: Record<string, string>) => {
	const response = await apiRequest<{
		enhanced_text: string
		hashtags: string[]
	}>({
		baseUrl: process.env.NEXT_PUBLIC_UPDATE_AI,
		url: `${UPDATE_AI}`,
		method: "POST",
		payload
	})
	return response
}

const updateUser = async (
	payload:
		| ProfileFormValues
		| StyleAndSkillsPayload
		| Record<string, string>
		| FormData,
	url?: string
) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: url ? `${USERS}/${url}` : USERS,
		method: "PUT",
		payload
	})
	return response?.data
}

const ayrshareSocialLink = async () => {
	const response = await apiRequest<ApiResponse<AyrshareJwtResponse>>({
		url: GET_AYRSHARE_JWT,
		method: "POST"
	})
	return response?.data
}

const uploadMedia = async (payload: FormData) => {
	const response = await apiRequest<ApiResponse<{ uri: string }>>({
		url: UPLOAD_MEDIA,
		method: "POST",
		payload
	})
	return response?.data
}

const createCommunityTopic = async (payload: Record<string, string>) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: CREATE_COMMUNITY_TOPIC,
		method: "POST",
		payload
	})
	return response?.data
}
const updateCommunityTopic = async ({
	topicId,
	payload
}: {
	topicId: string
	payload: { title: string; forumId: string; description: string }
}) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${UPDATE_COMMUNITY_TOPIC}${topicId}`,
		method: "PUT",
		payload
	})
	return response?.data
}

const addTopicComment = async (
	topicId: string,
	payload: Record<string, string>
) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${ADD_COMMENT_TO_TOPIC}${topicId}`,
		method: "POST",
		payload
	})
	return response?.data
}

const deleteCommunityTopic = async (topicId: string) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${DELETE_TOPIC}${topicId}`,
		method: "GET"
	})
	return response?.data
}

const createNFT = async (
	payload: Record<string, string | string[]>,
	id: string
) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `projects/${id}/nft`,
		method: "POST",
		payload
	})
	return response?.data
}

const verifyTokenOwnership = async (payload: Record<string, string>) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${NFT}/verifyTokenOwnership`,
		method: "POST",
		payload
	})
	return response?.data
}

const createLiveStream = async (payload: FormData) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: CREATE_LIVESTREAM,
		method: "POST",
		payload
	})
	return response?.data
}
const createDistro = async (payload: Record<string, string>) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${DISTRO}/create`,
		method: "POST",
		payload
	})
	return response?.data
}

const createMetadata = async (
	payload: Record<string, string | string[] | object | boolean>
) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${METADATA}/create`,
		method: "POST",
		payload
	})
	return response?.data
}

const updateMetadata = async (
	payload: Record<string, string | string[] | object | boolean>,
	id: string
) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${METADATA}/update/${id}`,
		method: "PUT",
		payload
	})
	return response?.data
}

const getStreamToken = async () => {
	const response = await apiRequest<ApiResponse<string>>({
		url: "stream/token/user",
		method: "POST"
	})
	return response?.data
}

const cancelSubscription = async (subscriptionId: string, wallet: string) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: "/coinflow/cancel-subscription",
		method: "POST",
		payload: {
			id: subscriptionId,
			wallet: wallet
		}
	})
	return response?.data
}

const updateStreamStatus = async (
	streamId: string,
	status: "live" | "completed"
) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${STREAM}/${streamId}/${status}`,
		method: "PUT"
	})
	return response?.data
}
const updateCoverImage = async (payload: FormData) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${USERS}/image/cover`,
		method: "PUT",
		payload
	})
	return response?.data
}

const sendMessage = async (
	payload: Record<string, string>,
	platform: string
) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `messages/${platform}`,
		method: "POST",
		payload
	})
	return response?.data
}

const addLyrics = async (payload: Record<string, string>) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${LYRICS}`,
		method: "POST",
		payload
	})
	return response?.data
}

const updateLyrics = async (payload: Record<string, string>, id: string) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${LYRICS}/${id}`,
		method: "PUT",
		payload
	})
	return response?.data
}

const deleteLyrics = async (id: string) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${LYRICS}/${id}`,
		method: "DELETE"
	})
	return response?.data
}

const sentimentAnalysis = async (payload: Record<string, string>) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: SENTIMENT_ANALYSIS,
		method: "POST",
		payload
	})
	return response?.data
}

const deleteGoogleStorageFiles = async (payload: Record<string, string>) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: GCP_DELETE_API,
		method: "POST",
		payload
	})
	return response?.data
}

const missionScrappers = async (
	social: string,
	payload: {
		email?: string
		url?: string
		mobile?: string
		countryCode?: string
		code?: string
		post?: string
		questId: string
	}
) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${SCRAPPER}/${social}`,
		method: "POST",
		payload
	})

	return response?.data
}

const otpSend = async (payload: { countryCode: string; mobile: string }) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${USERS}${OTP_SEND}`,
		method: "POST",
		payload
	})
	return response?.data
}

const publishCreatorQuest = async (payload: CreatorQuestPayload) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${CREATOR_QUEST}${CREATE}`,
		method: "POST",
		payload
	})
	return response?.data
}

const updateCreatorQuest = async (payload: CreatorQuestPayload) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${CREATOR_QUEST}/update`,
		method: "POST",
		payload
	})
	return response?.data
}

const unPublishCreatorQuest = async (payload: {
	isPublished: boolean
	creatorQuestId: string
}) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${CREATOR_QUEST}/published`,
		method: "POST",
		payload
	})
	return response?.data
}

const fileNameCheck = async (payload: Record<string, string[]>) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: `${TRACK}/track-name`,
		method: "POST",
		payload
	})
	return response?.data
}

const markAsRead = async (payload: { id: string }) => {
	const response = await apiRequest<ApiResponse<Response>>({
		url: MARK_AS_READ,
		method: "POST",
		payload
	})
	return response?.data
}

const fetchGuildedSignature = async (payload: {
	buyer: string
	tokenId: number
	networkChainId: string
}) => {
	const response = await apiRequest<ApiResponse<{
		signature: string
		timestamp: number
		maxPrice: string
	}>>({
		url: `/guilded-nft/signature`,
		method: "POST",
		payload
	})
	return response?.data
}


export {
	createUser,
	validateToken,
	createFolder,
	createTrack,
	UpdateFolder,
	FetchMediaList,
	FetchMediaContent,
	createProject,
	resetPassword,
	checkEmail,
	sendInvite,
	updateProjectCollaborators,
	updateTrack,
	login,
	socialLogin,
	verifyGoogleLogin,
	deleteTrack,
	CollaborationsOpportunites,
	addWallet,
	addTracksToProject,
	sendSmsInvite,
	deleteProject,
	updateProject,
	saveSongContest,
	deleteSavedSongContest,
	applySongContest,
	updateApplicationStatus,
	generateMedia,
	generateAudio,
	initateTrackComment,
	addComment,
	deleteComment,
	markAsResolvedComment,
	deleteTrackFromProject,
	createChannel,
	posttoSocialMedia,
	updateWithAi,
	updateUser,
	ayrshareSocialLink,
	uploadMedia,
	createCommunityTopic,
	updateCommunityTopic,
	addTopicComment,
	deleteCommunityTopic,
	createNFT,
	verifyTokenOwnership,
	createLiveStream,
	addFCMToken,
	createDistro,
	createMetadata,
	updateMetadata,
	updateCoverImage,
	sendMessage,
	getStreamToken,
	cancelSubscription,
	updateStreamStatus,
	addLyrics,
	updateLyrics,
	deleteLyrics,
	sentimentAnalysis,
	deleteGoogleStorageFiles,
	markAsRead,
	missionScrappers,
	otpSend,
	publishCreatorQuest,
	unPublishCreatorQuest,
	fileNameCheck,
	updateCreatorQuest,
	fetchGuildedSignature
}
