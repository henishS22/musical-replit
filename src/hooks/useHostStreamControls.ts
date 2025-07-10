import { useState } from "react"
import { useParams, useRouter } from "next/navigation"

import { updateStreamStatus } from "@/app/api/mutation"
import { Call } from "@stream-io/video-react-sdk"
import { useMutation } from "@tanstack/react-query"

/**
 * Hook to manage host stream controls (going live and ending stream)
 *
 * @param call - The Stream call instance
 * @returns Stream control methods and live status
 */
export const useHostStreamControls = (call: Call | undefined) => {
	const { id } = useParams()
	const router = useRouter()
	const [isLive, setIsLive] = useState(false)

	// Mutation to update stream status in backend
	const { mutate: updateStatus } = useMutation({
		mutationFn: (status: "live" | "completed") =>
			updateStreamStatus(id as string, status)
	})

	/**
	 * Start the live stream
	 */
	const handleGoLive = async () => {
		try {
			await call?.goLive()
			setIsLive(true)
			updateStatus("live")
		} catch (error) {
			console.error("Failed to go live:", error)
		}
	}

	/**
	 * End the live stream and redirect to home
	 */
	const handleEndStream = async () => {
		try {
			await call?.stopLive()
			updateStatus("completed")
			setIsLive(false)
			router.push("/")
		} catch (error) {
			console.error("Failed to end stream:", error)
		}
	}

	return { isLive, handleGoLive, handleEndStream }
}
