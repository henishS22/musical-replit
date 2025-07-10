import {
	INVITE_COLLABORATOR_MODAL,
	START_SOLO_MODAL,
	WORK_WITH_AI_MODAL
} from "@/constant/modalType"

import invite from "../assets/images/create-images/invite.png"
import start from "../assets/images/create-images/start.svg"
import work from "../assets/images/create-images/work.png"

export const createOptions = [
	{
		title: "Start Solo",
		icon: start,
		options: [
			{
				title: "Use Microphone:",
				value: "mic",
				type: START_SOLO_MODAL,
				description: "Record directly from the Guild Mic"
			},
			{
				title: "Use Camera:",
				value: "camera",
				type: START_SOLO_MODAL,
				description: "Capture video from your phone"
			},
			{
				title: "Upload Options:",
				value: "upload",
				type: START_SOLO_MODAL,
				description: "Pull in files locally, from Dropbox or Google"
			}
		]
	},
	{
		title: "Invite a Collaborator",
		icon: invite,
		options: [
			{
				title: "Invite by SMS:",
				type: INVITE_COLLABORATOR_MODAL,
				value: "sms",
				description: "Send invites to collaborators for your Project"
			},
			{
				title: "Invite by Email:",
				type: INVITE_COLLABORATOR_MODAL,
				value: "email",
				description: "Send invites to collaborators for your Project"
			},
			{
				title: "Create an Opportunity:",
				type: INVITE_COLLABORATOR_MODAL,
				value: "opportunity",
				description: "Post and opportunity to the community"
			}
		]
	},
	{
		title: "Work with AI",
		icon: work,
		options: [
			{
				title: "Song Ideas and Lyrics:",
				type: WORK_WITH_AI_MODAL,
				value: "song",
				description: "Use your Creative Agent with text or voice"
			},
			{
				title: "Work with Melodies:",
				type: WORK_WITH_AI_MODAL,
				value: "melody",
				description: "Give us an audio prompt for a spark"
			},
			{
				title: "Generate Visuals:",
				type: WORK_WITH_AI_MODAL,
				value: "visual",
				description: "Make compelling video from audio, text and images"
			}
		]
	}
]
