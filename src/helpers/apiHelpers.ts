/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from "react-toastify"

import { LOGIN_FAIL } from "@/constant/toastMessages"
import { FolderMovePayload } from "@/types"
import { CreateOpportunityPayload } from "@/types/createOpportunityTypes"
import { CreatorQuestPayload } from "@/types/missionTypes"
import { SocialMediaPostPayload } from "@/types/postToSocial"
import axios, { AxiosError, AxiosRequestConfig, Method } from "axios"
import Cookies from "js-cookie"

import { useDynamicStore } from "@/stores"

// Create an Axios instance
export const api = axios.create({
	headers: {
		"Content-Type": "application/json"
	}
})

// Add an interceptor to handle FormData
api.interceptors.request.use(
	(config) => {
		if (config.data instanceof FormData) {
			delete config.headers?.["Content-Type"]
		}
		return config
	},
	(error) => Promise.reject(error)
)

// Function to dynamically set the base URL
export const setBaseUrl = (baseUrl: string) => {
	api.defaults.baseURL = baseUrl
}

export const handleLogout = async (logoutAction?: () => void) => {
	const { resetState } = useDynamicStore.getState()
	Cookies.remove("next-auth.session-token")
	Cookies.remove("accessToken")
	window.location.href = "/login"
	resetState()
	if (logoutAction) logoutAction()
}

// Define request function types
interface ApiRequestConfig {
	url: string
	method?: Method
	payload?:
		| Record<string, string | object | number | boolean>
		| FormData
		| FolderMovePayload
		| null
		| CreateOpportunityPayload
		| SocialMediaPostPayload
		| CreatorQuestPayload
	baseUrl?: string
	responseType?: "json" | "arraybuffer" | "blob" | "text"
}

// Main API request function
export const apiRequest = async <T extends object>({
	url,
	method = "GET",
	payload = null,
	baseUrl = process.env.NEXT_PUBLIC_BASE_URL,
	responseType
}: ApiRequestConfig): Promise<T | null> => {
	try {
		const token = Cookies.get("accessToken") || null

		// Set base URL if provided
		if (baseUrl) setBaseUrl(baseUrl)

		// Configure request headers
		const headers = token ? { Authorization: `Bearer ${token}` } : undefined

		// Create Axios configuration object
		const config: AxiosRequestConfig = {
			method,
			url,
			headers,
			...(payload && { data: payload }),
			...(responseType && { responseType })
		}

		const response = await api.request<T>(config)

		return response.data
	} catch (error: any) {
		const axiosError = error as AxiosError

		if (axiosError.response?.status === 401) {
			toast.error(LOGIN_FAIL)
			handleLogout()
		} else {
			interface AxiosErrorResponse {
				error?: {
					message?: string
				}
				message?: string
			}

			const message =
				(axiosError.response?.data as AxiosErrorResponse)?.error?.message ||
				(axiosError.response?.data as AxiosErrorResponse)?.message ||
				"Your request has failed, please try again"
			toast.dismiss()
			toast.error(message)
		}

		if (error.response.data) {
			return error.response
		}

		return null
	}
}
