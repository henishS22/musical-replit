import { livestreamSchema } from "@/validationSchema/livestreamSchema"
import { z } from "zod"

export interface ScheduleData {
	scheduleDate: string
	scheduleTime: string
	isSchedulePost: boolean
}

export type LivestreamFormData = z.infer<typeof livestreamSchema>
