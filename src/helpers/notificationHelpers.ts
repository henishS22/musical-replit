import { NotificationData } from "@/types/notificationTypes"
import { format } from "date-fns"

export const getNotificationContent = (notification: NotificationData) => {
	switch (notification.type) {
		case "REMOVE_COLLABORATOR":
			return {
				action: "Removed",
				target: `${notification?.data?.collaboratorName} from project ${notification?.resource?.name}`,
				link: `/project/${notification?.resource?._id}`
			}
		case "ADD_COLLABORATOR":
			return {
				action: "Added",
				target: `${notification?.data?.collaboratorName} to project ${notification?.resource?.name}`,
				link: `/project/${notification?.resource?._id}`
			}
		case "CHAT_MESSAGE":
			return {
				action: "Sent you a message:",
				target: notification?.data?.message,
				link: `/chat?_channel=${notification?.data?.identifier}`
			}
		case "RENAMED_PROJECT":
			return {
				action: "Renamed project",
				target: `from ${notification?.data?.oldName} to ${notification?.data?.newName}`,
				link: `/project/${notification?.resource?._id}`
			}
		case "RENAMED_RELEASE":
			return {
				action: "Renamed release",
				target: `${notification?.data?.release?.name} from ${notification?.data?.oldName} to ${notification?.data?.newName}`,
				link: `/project/${notification?.resource?._id}`
			}
		case "ADDED_TRACKS_TO_RELEASE":
			return {
				action: "Added tracks",
				target: `${notification?.data?.tracks?.length} track(s) to release ${notification?.data?.release?.name}`,
				link: `/project/${notification?.resource?._id}`
			}
		case "REMOVED_TRACKS_FROM_RELEASE":
			return {
				action: "Removed tracks",
				target: `${notification?.data?.tracks?.length} track(s) from release ${notification?.data?.release?.name}`,
				link: `/project/${notification?.resource?._id}`
			}
		case "COMMENTED_ON_PROJECT":
			return {
				action: "Commented on",
				target: `project ${notification?.resource?.name}`,
				link: `/project/${notification?.resource?._id}`
			}
		case "USER_FOLLOWED_YOU":
			return {
				action: "Followed",
				target: "you",
				link: `/profile/${notification?.from?._id}`
			}
		case "USER_REACTED_TO_ACTIVITY":
			return {
				action: "Reacted to",
				target: "your activity",
				// link: `/explore?id=${notification?.data?.activityId}`
				link: `/community`
			}
		case "USER_COMMENTED_ON_ACTIVITY":
			return {
				action: "Commented on",
				target: notification?.data?.comment,
				// link: `/explore?id=${notification?.data?.activityId}`
				link: `/community`
			}
		case "ADDED_TRACKS_TO_FINAL_VERSION":
			return {
				action: "Added tracks",
				target: `${notification?.data?.tracks?.length} track(s) to the final version of the release ${notification?.data?.release?.name}`,
				link: `/project/${notification?.resource?._id}`
			}
		case "REMOVED_TRACKS_FROM_FINAL_VERSION":
			return {
				action: "Removed tracks",
				target: `${notification?.data?.tracks?.length} track(s) from the final version of the release ${notification?.data?.release?.name}`,
				link: `/project/${notification?.resource?._id}`
			}
		case "USER_ANSWERED_CONTRACT_SPLIT":
			return {
				action: "Answered to contract splits",
				target: `for release ${notification?.data?.release?.name}`,
				link: `/project/${notification?.resource?._id}`
			}
		case "UPDATED_RELEASE_SPLITS":
			return {
				action: "Updated release splits",
				target: `for release ${notification?.data?.release?.name}`,
				link: `/project/${notification?.resource?._id}`
			}
		case "PUBLIC_STREAM":
			return {
				action: "Scheduled a live stream",
				target: `on ${notification?.data?.scheduleDate ? format(new Date(notification.data.scheduleDate), "do MMMM yyyy 'at' HH:mm") : ""}`,
				link: `/featured-livestream`
			}
		case "PRIVATE_STREAM":
			return {
				action: "Scheduled a private live stream",
				target: `on ${notification?.data?.scheduleDate ? format(new Date(notification.data.scheduleDate), "do MMMM yyyy 'at' HH:mm") : ""}`,
				link: `/buy-nft/${notification?.resource?._id}`
			}
		case "ACCEPT_INVITATION":
			return {
				action: "Accepted your invitation",
				target: "and joined the Musical platform",
				link: `/profile/${notification?.from?._id}`
			}
		case "COLLABORATOR_REQ":
			return {
				action: "Requested to join as a collaborator",
				target: `on project ${notification?.resource.name}`,
				link: `/project/${notification?.resource?._id}`
			}
		case "COLLABORATOR_ADDED":
			return {
				action: "Added you as a collaborator",
				target: `on project ${notification?.resource?.name}`,
				link: `/project/${notification?.resource?._id}`
			}
		case "COMMENTED_ON_TRACK":
			return {
				action: "Commented on",
				target: `track ${notification?.data?.trackId?.name}`,
				link: `/project/${notification?.resource?._id}`
			}
		case "NFT_BUY":
			return {
				action: "Bought your NFT",
				target: `${notification?.data?.nftId?.title}`,
				link: `/buy-nft/${notification?.data?.nftId?._id}`
			}
		case "ADDED_TRACKS_TO_PROJECT":
			return {
				action: "Added",
				target: `${notification?.data?.trackIds?.[0]?.name} track to project ${notification?.resource?.name}`,
				link: `/project/${notification?.resource?._id}`
			}
		case "NFT_EXCHANGE_APPROVED":
			return {
				action: `${notification?.from?.name} approved your NFT exchange`,
				// target: `${notification?.data?.nftId?.title}`,
				link: `/exchange-nft/${notification?.resource?._id}`
			}
		case "GAMIFICATION_TOKENS":
			return {
				action: `You earned ${notification?.data?.eventId?.points} NOTEs for`,
				target: `${notification?.data?.eventId?.name}`
			}
		case "MISSION_PERFORMED":
			return {
				action: "Mission performed",
				target: `Your mission ${notification?.data?.eventId?.name} was performed by ${notification?.from?.name}`,
				// You can add a link if you have a relevant page, otherwise omit or set to "/"
				link: "/missions"
			}
		case "MISSION_COMPLETED":
			return {
				action: "Mission completed",
				target: `You earned ${notification?.data?.eventId?.points} NOTEs for ${notification?.data?.eventId?.name}`,
				link: "/missions"
			}
		default:
			return {
				action: "Interacted with",
				target: notification?.resource?.name,
				link: "/"
			}
	}
}
