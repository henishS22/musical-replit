"use client"

import { useEffect, useState } from "react"

import { addFCMToken } from "@/app/api/mutation"
import { TitleBadgeCard } from "@/components/ui"
import { firebaseApp } from "@/lib/firebase/firebase"
import { useMutation } from "@tanstack/react-query"
import { getMessaging, onMessage } from "firebase/messaging"

import { useLibraryStore, useUserStore } from "@/stores"
import { useFetchAllData } from "@/hooks"
import useFcmToken from "@/hooks/firebase/useFCMToken"

import { InsightsSection } from "../insights-section"
import { JumpBackSection } from "../jumpback/jump-back-section"
import MissionsSection from "../missions"
import { OverviewSection } from "../overview/overview-section"
import { RecentFiles } from "../recent-files/recent-files-section"

interface DateRange {
	startDate?: Date
	endDate?: Date
}

// Separate client component for state management
export const DashboardContent = () => {
	const [selectedValueInsights, setSelectedValueInsights] = useState<string>()
	const [selectedValueJumpback, setSelectedValueJumpback] =
		useState<DateRange>()
	const [selectedValueRecent, setSelectedValueRecent] = useState<DateRange>()
	const { genreQuery, instrumentQuery, tagsQuery } = useFetchAllData()
	const { fcmToken } = useFcmToken()
	const { user } = useUserStore()

	const { mutate } = useMutation({
		mutationFn: addFCMToken
	})

	const { setData } = useLibraryStore()

	useEffect(() => {
		if (fcmToken && user?.id) {
			mutate({ token: fcmToken, userId: user?.id })
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fcmToken, user?.id])

	// eslint-disable-next-line react-hooks/rules-of-hooks
	useEffect(() => {
		if (typeof window !== "undefined" && "serviceWorker" in navigator) {
			try {
				const messaging = getMessaging(firebaseApp)
				const unsubscribe = onMessage(messaging, (payload) => {
					try {
						console.info("Foreground push notification received:", payload)
						// Handle the received push notification while the app is in the foreground
						// You can display a notification or update the UI based on the payload
					} catch (innerError) {
						console.error("Error handling push notification:", innerError)
					}
				})
				return () => {
					try {
						unsubscribe() // Unsubscribe from the onMessage event
					} catch (cleanupError) {
						console.error("Error during cleanup:", cleanupError)
					}
				}
			} catch (error) {
				console.error("Error initializing push notifications:", error)
			}
		}
	}, [])

	useEffect(() => {
		if (genreQuery && Array.isArray(genreQuery)) {
			setData("genres", genreQuery)
		}
		if (instrumentQuery && Array.isArray(instrumentQuery)) {
			setData("instruments", instrumentQuery)
		}
		if (tagsQuery && Array.isArray(tagsQuery)) {
			setData("tags", tagsQuery)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [genreQuery, instrumentQuery, tagsQuery])

	return (
		<>
			<TitleBadgeCard title="Get Started" markColor="#8A8A8A">
				<OverviewSection />
			</TitleBadgeCard>
			<TitleBadgeCard
				title="Insights"
				markColor="#8A8A8A"
				selectedValue={selectedValueInsights}
				disableFutureDates={true}
				setSelectedValue={setSelectedValueInsights}
			>
				<InsightsSection />
			</TitleBadgeCard>
			<TitleBadgeCard
				title="Missions"
				markColor="#8A8A8A"
				selectedValue={selectedValueInsights}
				disableFutureDates={true}
				setSelectedValue={setSelectedValueInsights}
			>
				<MissionsSection />
			</TitleBadgeCard>
			<TitleBadgeCard
				title="Jump Back In"
				markColor="#8A8A8A"
				isFilter
				disableFutureDates={true}
				selectedValue={selectedValueJumpback}
				setSelectedValue={setSelectedValueJumpback}
			>
				<JumpBackSection selectedValue={selectedValueJumpback} />
			</TitleBadgeCard>
			<TitleBadgeCard
				title="Recent Files"
				markColor="#8A8A8A"
				isFilter
				disableFutureDates={true}
				selectedValue={selectedValueRecent}
				setSelectedValue={setSelectedValueRecent}
			>
				<RecentFiles selectedValue={selectedValueRecent} />
			</TitleBadgeCard>
		</>
	)
}
