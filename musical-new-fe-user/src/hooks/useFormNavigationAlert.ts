// hooks/useFormNavigationAlert.ts
"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

import { FORM_NAVIGATION_ALERT_MODAL } from "@/constant/modalType"

import { useDynamicStore, useModalStore } from "@/stores"

interface FormNavigationAlertProps {
	formState: {
		isDirty: boolean
	}
}

export const useFormNavigationAlert = ({
	formState
}: FormNavigationAlertProps) => {
	const { isDirty } = formState
	const { addState, updateState } = useDynamicStore()
	const router = useRouter()
	const { showCustomModal } = useModalStore()

	// Update the form navigation state when dirty state changes
	useEffect(() => {
		addState("formNavigation", {
			isDirty,
			pendingNavigation: null
		})

		updateState("formNavigation", { isDirty })

		return () => {
			// Clean up when component unmounts
			updateState("formNavigation", { isDirty: false })
		}
	}, [isDirty, addState, updateState])

	// Override the router push method to intercept navigation
	const originalPushRef = useRef(router.push)

	useEffect(() => {
		originalPushRef.current = router.push

		router.push = (href, options) => {
			if (useDynamicStore.getState().formNavigation.isDirty) {
				updateState("formNavigation", {
					isDirty: true,
					pendingNavigation: href
				})
				showCustomModal({ customModalType: FORM_NAVIGATION_ALERT_MODAL })
				return Promise.resolve(false)
			}
			return originalPushRef.current(href, options)
		}

		return () => {
			router.push = originalPushRef.current
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isDirty])

	// Handle browser back/forward buttons and page reload
	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (isDirty) {
				e.preventDefault()
				return ""
			}
		}

		window.addEventListener("beforeunload", handleBeforeUnload)

		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload)
		}
	}, [isDirty])

	return { isDirty }
}
