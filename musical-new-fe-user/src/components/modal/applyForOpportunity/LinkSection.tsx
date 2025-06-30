import React, { useState } from "react"

import { CustomInput } from "@/components/ui"
import { Button } from "@nextui-org/react"
import { Trash2 } from "lucide-react" // Import the delete icon

interface LinksSectionProps {
	setLinks: (links: string[]) => void
	links: string[]
}

const LinksSection: React.FC<LinksSectionProps> = ({ setLinks, links }) => {
	const [inputValue, setInputValue] = useState<string>("")
	const [error, setError] = useState<string | null>(null)

	const validateLink = (link: string): boolean => {
		// Regex to validate proper URL format
		const urlPattern =
			// eslint-disable-next-line no-useless-escape
			/^(http(s):\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/g

		// If it matches the pattern, it is valid
		if (urlPattern.test(link)) return true
		return false
	}

	const handleAddLink = () => {
		if (links.length >= 10) {
			setError("You can only add up to 10 links.")
			return
		}

		if (!inputValue.trim()) {
			setError("Please enter a URL.")
			return
		}

		if (!validateLink(inputValue)) {
			setError("Please enter a valid URL.")
			return
		}

		// Check for duplicate URLs
		if (links.includes(inputValue)) {
			setError("This URL has already been added.")
			return
		}

		// Add the link and reset the input and error state
		setLinks([...links, inputValue])
		setInputValue("") // Clear the input box
		setError(null) // Clear any previous error
	}

	const handleRemoveLink = (index: number) => {
		const updatedLinks = links.filter((_, i) => i !== index) // Remove the link at the specified index
		setLinks(updatedLinks)
	}

	return (
		<div className="flex flex-col mt-4 w-full text-black max-md:max-w-full">
			<div className="flex flex-col w-full max-md:max-w-full">
				<div className="text-sm font-bold tracking-tight max-md:max-w-full">
					Links
				</div>
				<div className="mt-1 text-xs tracking-normal max-md:max-w-full">
					Add up to 10 links from any site you want to share with the
					collaborator
				</div>
			</div>

			<div className="flex items-center gap-2 mt-2">
				<div className="w-full grow">
					<CustomInput
						type="url"
						placeholder="Enter a link"
						aria-label="Enter a link to share with collaborator"
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
					/>
				</div>
				<Button
					onPress={handleAddLink}
					className="px-4 py-2 bg-btnColor text-white "
				>
					Add
				</Button>
			</div>

			{error && <div className="text-red-500 text-sm mt-1">{error}</div>}

			<div className="mt-2">
				{links.map((link, index) => (
					<div key={index} className="flex items-center justify-between mb-2">
						<span className="text-sm text-gray-700">{link}</span>
						<button
							onClick={() => handleRemoveLink(index)}
							className="text-red-500 hover:text-red-700"
							aria-label="Remove link"
						>
							<Trash2 className="w-4 h-4" /> {/* Lucide delete icon */}
						</button>
					</div>
				))}
			</div>
		</div>
	)
}

export default LinksSection
