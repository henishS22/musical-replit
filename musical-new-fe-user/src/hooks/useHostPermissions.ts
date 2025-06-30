import { useEffect, useState } from "react"

import { Call, PermissionRequestEvent } from "@stream-io/video-react-sdk"

/**
 * Hook to manage permission requests in a host stream
 * Handles viewer requests to join stream with audio/video
 *
 * @param call - The Stream call instance
 * @returns Permission request handlers and current requests
 */
export const useHostPermissions = (call: Call | undefined) => {
	const [permissionRequests, setPermissionRequests] = useState<
		PermissionRequestEvent[]
	>([])

	/**
	 * Handle permission request from a viewer
	 *
	 * @param request - The permission request event
	 * @param accept - Whether to accept or reject the request
	 */
	const handlePermissionRequest = async (
		request: PermissionRequestEvent,
		accept: boolean
	) => {
		const { user, permissions } = request
		try {
			if (accept) {
				await call?.grantPermissions(user.id, permissions)
			} else {
				await call?.revokePermissions(user.id, permissions)
			}
			setPermissionRequests((reqs) => reqs.filter((req) => req !== request))
		} catch (err) {
			console.error(`Error managing permissions:`, err)
		}
	}

	// Set up permission request listener
	useEffect(() => {
		if (!call) return

		const unsubscribe = call.on("call.permission_request", (event) => {
			const request = event as PermissionRequestEvent
			setPermissionRequests((reqs) => [...reqs, request])
		})

		return () => {
			unsubscribe()
		}
	}, [call])

	return { permissionRequests, handlePermissionRequest }
}
