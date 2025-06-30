"use client"

import React, { useEffect, useRef, useState } from "react"
import Image from "next/image"

import { AVTAR_IMAGE, SERACH_ICON } from "@/assets"
import { Button } from "@nextui-org/react"
import { ChevronDown, Plus } from "lucide-react"

interface CollaboratorSearchProps {
	onAddCollaborator: (collaborator: string) => void
}

export function CollaboratorSearch({
	onAddCollaborator
}: CollaboratorSearchProps) {
	const [searchOpen, setSearchOpen] = useState(false)
	const [searchValue, setSearchValue] = useState("")
	const [searchOptions, setSearchOptions] = useState<string[]>([
		"Anubhav Dwivedi",
		"Anvaya",
		"Antrix"
	])

	const searchRef = useRef<HTMLDivElement>(null)

	const handleSearchChange = (value: string) => {
		setSearchValue(value)
		const filteredOptions = ["Anubhav Dwivedi", "Anvaya", "Antrix"].filter(
			(option) => option.toLowerCase().includes(value.toLowerCase())
		)
		setSearchOptions(filteredOptions)
	}

	const toggleSearch = () => {
		setSearchOpen((prev) => !prev)
		if (searchOpen) {
			setSearchValue("")
			setSearchOptions(["Anubhav Dwivedi", "Anvaya", "Antrix"])
		}
	}

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				searchRef.current &&
				!searchRef.current.contains(event.target as Node)
			) {
				setSearchOpen(false) // Close the search bar when clicking outside
			}
		}

		// Add event listener
		document.addEventListener("mousedown", handleClickOutside)

		// Cleanup listener
		return () => {
			document.removeEventListener("mousedown", handleClickOutside)
		}
	}, [])

	return (
		<div className="w-full max-w-[320px]" ref={searchRef}>
			<div className="flex justify-end">
				<Button
					className="bg-[#DDF5E5] text-[#0D5326] gap-1 px-3 py-1.5 rounded-lg w-[72px] h-[24px]"
					endContent={<Plus className="w-4 h-4" />}
					onPress={toggleSearch}
				>
					Add
				</Button>
			</div>

			{searchOpen && (
				<div className="relative mt-2">
					<div className="relative">
						<Image
							src={SERACH_ICON}
							alt="Search"
							className="absolute left-3 top-1/2 -translate-y-1/2"
							width={16}
							height={16}
						/>
						<ChevronDown
							className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textGray cursor-pointer"
							onClick={toggleSearch}
						/>
						<input
							type="text"
							value={searchValue}
							placeholder="Search collaborators"
							className="w-full pl-10 pr-10 py-2.5 text-sm text-textPrimary bg-white border border-customGray rounded-lg placeholder-textGray focus:outline-none focus:ring-1 focus:ring-[#DDF5E5]"
							onChange={(e) => handleSearchChange(e.target.value)}
							autoFocus
						/>
					</div>

					{searchOptions.length > 0 && (
						<div className="absolute z-50 w-full mt-1">
							<div className="bg-white border border-customGray rounded-lg shadow-lg overflow-hidden">
								<ul className="max-h-[200px] overflow-y-auto py-1">
									{searchOptions.map((option, index) => (
										<li
											key={index}
											onClick={() => {
												onAddCollaborator(option)
												setSearchOpen(false) // Close search after selecting an option
												setSearchValue("")
											}}
											className="flex items-center gap-2 px-3 py-2 hover:bg-[#F9F9F9] cursor-pointer"
										>
											<Image
												src={AVTAR_IMAGE}
												alt={`${option}'s avatar`}
												className="rounded-full"
												width={24}
												height={24}
											/>
											<span className="text-sm text-textPrimary">{option}</span>
										</li>
									))}
								</ul>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	)
}
