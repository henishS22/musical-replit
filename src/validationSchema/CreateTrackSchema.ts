import { z } from "zod"

const createTrackSchema = z.object({
	track: z.object({
		artist: z.string().min(1, "Artist name is required"),
		language: z.string().min(1, "Language is required"),
		trackId: z.string().optional()
	}),
	artist: z.object({
		performerCredit: z.string().min(1, "Performer credit is required"),
		writeCredit: z.string().min(1, "Write credit is required"),
		additionalCredit: z.string().optional(),
		role: z.string().min(1, "Role is required")
	}),
	trackMetadata: z.object({
		labelName: z.string().min(1, "Label name is required"),
		copyrightName: z.string().min(1, "Copyright name is required"),
		copyrightYear: z.string().min(1, "Copyright year is required"),
		countryOfRecording: z.string().min(1, "Country is required"),
		trackISRC: z.string().min(1, "ISRC is required"),
		lyrics: z.string().min(1, "Lyrics are required")
	}),
	ownership: z.object({
		ownership: z.boolean(),
		territories: z.string().min(1, "Territories are required")
	}),
	compositionRights: z.array(
		z.object({
			composerName: z.string().min(1, "Composer name is required"),
			rightsManagement: z.string().min(1, "Rights management is required"),
			percentageOfOwnership: z
				.number()
				.min(0, "Percentage must be greater than 0")
				.max(100, "Percentage must be less than or equal to 100")
		})
	),
	releaseStatus: z.object({
		previouslyReleased: z.boolean(),
		upc: z.string().min(1, "UPC is required"),
		releaseDate: z.string().min(1, "Release date is required")
	}),
	royalty: z.array(
		z.object({
			userName: z.string().min(1, "User name is required"),
			userImage: z.string().optional(),
			splitValue: z.string().min(1, "Split value is required"),
			walletAddress: z.string().min(1, "Wallet address is required"),
			id: z.string().min(1, "Id is required")
		})
	),
	isSendForRelease: z.boolean().optional()
})

export type CreateTrackFormData = z.infer<typeof createTrackSchema>
export default createTrackSchema
