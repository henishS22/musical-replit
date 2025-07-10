import React from "react"

import { AlertCircle, AlertTriangle, CheckCircle } from "lucide-react"

type SentimentType = "positive" | "negative" | "neutral"

export const getSentimentIcon = (sentiment: SentimentType): JSX.Element => {
	switch (sentiment) {
		case "positive":
			return <CheckCircle className="w-5 h-5 text-green-500" />
		case "negative":
			return <AlertTriangle className="w-5 h-5 text-red-500" />
		default:
			return <AlertCircle className="w-5 h-5 text-gray-500" />
	}
}

export const getSentimentColor = (sentiment: SentimentType): string => {
	switch (sentiment) {
		case "positive":
			return "text-green-500"
		case "negative":
			return "text-red-500"
		default:
			return "text-gray-500"
	}
}
