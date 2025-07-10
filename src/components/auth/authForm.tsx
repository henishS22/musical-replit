"use client"

import { useCallback, useEffect, useState } from "react"
import { getProviders, signIn, signOut } from "next-auth/react"
import { useSearchParams } from "next/navigation"

import { Spinner } from "@nextui-org/react"

export default function AuthForm() {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [providerConfig, setProviderConfig] = useState<any | null>(null)

	const searchParams = useSearchParams()
	const redirectUri = searchParams.get("redirect_uri")
	const provider = searchParams.get("provider")
	const error = searchParams.get("error")

	const handleSignIn = () => {
		if (providerConfig && !error) {
			signIn(providerConfig.id)
		}
	}

	const handleSignOut = useCallback(async () => {
		await signOut({ redirect: false })
		if (redirectUri) {
			window.location.href = redirectUri
		}
	}, [redirectUri])

	useEffect(() => {
		if (providerConfig) {
			handleSignIn()
		} else {
			handleSignOut()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [providerConfig])

	useEffect(() => {
		const fetchProviders = async () => {
			try {
				const providers = await getProviders()
				if (provider && providers) {
					setProviderConfig(providers[provider])
				}
			} catch (e) {
				console.error("Failed to fetch providers", e)
			}
		}

		fetchProviders()
	}, [provider])

	return (
		<div className="flex justify-center items-center min-h-screen">
			{error ? (
				<div className="text-center">
					<h1 className="text-2xl font-bold text-red-500">Error</h1>
					<p className="text-gray-600">{error}</p>
				</div>
			) : (
				<Spinner size="lg" />
			)}
		</div>
	)
}
