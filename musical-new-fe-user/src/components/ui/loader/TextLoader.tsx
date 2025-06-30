import { useEffect, useState } from "react"

const VerifyingText = () => {
	const [dots, setDots] = useState("")

	useEffect(() => {
		const interval = setInterval(() => {
			setDots((prev) => {
				if (prev === "...") return ""
				return prev + "."
			})
		}, 500)

		return () => clearInterval(interval)
	}, [])

	return <span className="ml-2 text-sm text-textGray">Verifying{dots}</span>
}

export default VerifyingText
