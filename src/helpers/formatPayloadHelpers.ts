import { Track } from "@/types"
import {
	CreateOpportunityPayload,
	OpportunityInputData
} from "@/types/createOpportunityTypes"
import { SocialMediaPostPayload } from "@/types/postToSocial"
import { PostFormData } from "@/types/PromoteTypes"

import { formatToISO } from "./common"

function formatOpportunityPayload(
	data: OpportunityInputData,
	engageFlow: boolean
): CreateOpportunityPayload {
	return {
		projectId: data?.selectedProject?._id || "",
		title: data?.title,
		brief: data?.brief,
		seeking: data?.skills,
		...(!engageFlow && { styles: data?.styles }),
		languages: data?.languagesId,
		// if engage flow is true, then manage collaborateWith as fans
		collaborateWith: !engageFlow ? "ARTISTS" : "FANS",
		//if engage flow is true, then the collaboration type is required
		...(engageFlow &&
			data?.collaborationType && {
				collaborationType: data?.collaborationType
			}),
		...(data?.designs && { designs: data?.designs }),
		duration: {
			startFrom: new Date(data?.duration?.startDate),
			endTo: new Date(data?.duration?.endDate)
		},
		// Remove the trackId from the selectedTracks array and add it to the tracks array
		tracks: [
			...data.selectedTracks
				.filter((track) => track._id !== data?.uploadedTrack?._id)
				.map((track) => track._id),
			data?.uploadedTrack?._id
		]
	}
}

export default formatOpportunityPayload

export function createSocialMediaPayload(
	formData: PostFormData,
	selectedPlatforms: string[],
	mediaUrl: string,
	trackInfo: Track,
	isScheduledPost: boolean,
	scheduledTime: string,
	schduledDate: string
): SocialMediaPostPayload {
	return {
		post: `${formData.postText} ${formData.hashtags}`,
		platforms: selectedPlatforms,
		mediaUrls: [mediaUrl],
		...(isScheduledPost && {
			scheduleDate: formatToISO(schduledDate, scheduledTime)
		}),
		...(selectedPlatforms.includes("pinterest") && {
			pinterestOptions: {
				thumbNail:
					trackInfo?.artwork ||
					`${process.env.NEXT_PUBLIC_BASE_URL}/instrument/artwork.png`
			}
		}),
		...(selectedPlatforms.includes("facebook") && {
			pinterestOptions: {
				title: formData.postText,
				thumbnail:
					trackInfo?.artwork ||
					`${process.env.NEXT_PUBLIC_BASE_URL}/instrument/artwork.png`
			}
		}),
		...(selectedPlatforms.includes("youtube") && {
			youTubeOptions: {
				title: trackInfo?.name || "",
				visibility: "public",
				tags: formData.hashtags
			}
		}),
		...(selectedPlatforms.includes("reddit") && {
			redditOptions: {
				title: trackInfo?.name || "",
				subreddit: "music"
			}
		}),
		isVideo: true
	}
}
