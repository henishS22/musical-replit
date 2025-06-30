import { useEffect, useState } from "react"

import { firebaseApp } from "@/lib/firebase/firebase"
import { getMessaging, getToken } from "firebase/messaging"

const useFcmToken = () => {
	const [token, setToken] = useState("")
	const [notificationPermissionStatus, setNotificationPermissionStatus] =
		useState("")
	const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
	useEffect(() => {
		const retrieveToken = async () => {
			try {
				if (typeof window !== "undefined" && "serviceWorker" in navigator) {
					const messaging = getMessaging(firebaseApp)

					// Retrieve the notification permission status
					const permission = await Notification.requestPermission()
					setNotificationPermissionStatus(permission)

					// Check if permission is granted before retrieving the token
					if (permission === "granted") {
						const currentToken = await getToken(messaging, {
							vapidKey: vapidKey
						})
						if (currentToken) {
							setToken(currentToken)
						} else {
							console.error(
								"No registration token available. Request permission to generate one."
							)
						}
					}
				}
			} catch (error) {
				console.error("An error occurred while retrieving token:", error)
			}
		}

		retrieveToken()
	}, [vapidKey])

	return { fcmToken: token, notificationPermissionStatus }
}

export default useFcmToken
