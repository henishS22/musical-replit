"use client"

import React, { useState } from "react"

import { fetchLang } from "@/app/api/query"
import { Language } from "@/types/createOpportunityTypes"
import { Filter } from "@/types/opportunity"
import {
	Accordion,
	AccordionItem,
	Button,
	cn,
	Radio,
	RadioGroup
} from "@nextui-org/react"
import { useQuery } from "@tanstack/react-query"

import { useLibraryStore } from "@/stores"

import SelectableOptions from "../createOpportunity/ProjectNeeds/SelectableOptions"
import { SearchBar } from "./SearchBar"

interface FilterSectionProps {
	setFilter: (filter: Filter) => void
	filter: Filter
}

export const FilterSection: React.FC<FilterSectionProps> = ({
	setFilter,
	filter
}) => {
	const { genres, instruments } = useLibraryStore()
	const [searchQueryInstruments, setSearchQueryInstruments] = useState("")
	const [searchQueryLanguages, setSearchQueryLanguages] = useState("")
	const [searchQuerySkills, setSearchQuerySkills] = useState("")

	// Local state for filters before applying
	const [localFilter, setLocalFilter] = useState<Filter>({ ...filter })

	const { data } = useQuery({
		queryKey: ["language"],
		queryFn: () => fetchLang(),
		staleTime: 3000
	})

	const handleApplyFilters = () => {
		setFilter(localFilter)
	}

	const handleClearFilters = () => {
		setLocalFilter({
			seeking: [],
			style: [],
			languages: [],
			collaborateWith: "ARTISTS"
		})
		setFilter({
			seeking: [],
			style: [],
			languages: [],
			collaborateWith: "ARTISTS"
		})
	}

	return (
		<div className="flex z-0 flex-col px-6 py-3 font-bold rounded-lg border border-solid border-zinc-100 min-w-[240px] w-[339px] h-full">
			<h2 className="text-base tracking-normal leading-relaxed text-zinc-900">
				Filters
			</h2>
			<Accordion
				selectionMode="multiple"
				defaultExpandedKeys={["1"]}
				showDivider={false}
			>
				<AccordionItem
					title="Skills Required"
					key="1"
					classNames={{
						trigger: "pb-0",
						title:
							"font-semibold text-sm leading-[24px] tracking-[-0.01em] text-textPrimary"
					}}
				>
					<SearchBar
						placeholder="Search"
						className="mt-2"
						onChange={(e) => setSearchQueryInstruments(e.target.value)}
					/>
					<div className="flex flex-wrap gap-2 mt-2">
						<SelectableOptions
							data={instruments.filter((instrument) =>
								instrument.title
									.toLowerCase()
									.includes(searchQueryInstruments.toLowerCase())
							)}
							selectedItems={localFilter.seeking}
							onItemChange={(item: string | Language) => {
								setLocalFilter((prev) => ({
									...prev,
									seeking: prev.seeking.includes(item as string)
										? prev.seeking.filter((i) => i !== item)
										: [...prev.seeking, item as string]
								}))
							}}
							classNames={{ base: "!mt-0" }}
							icon={true}
						/>
					</div>
				</AccordionItem>
				<AccordionItem
					title="Languages"
					key="2"
					classNames={{
						trigger: "pb-0",
						title:
							"font-semibold text-sm leading-[24px] tracking-[-0.01em] text-textPrimary"
					}}
				>
					<SearchBar
						placeholder="Search"
						className="mt-2"
						onChange={(e) => setSearchQueryLanguages(e.target.value)}
					/>
					<div className="flex flex-wrap gap-2 mt-2">
						<SelectableOptions
							data={
								data?.filter((language) =>
									language.title
										.toLowerCase()
										.includes(searchQueryLanguages.toLowerCase())
								) || []
							}
							selectedItems={localFilter.languages}
							onItemChange={(item: string | Language) => {
								setLocalFilter((prev) => ({
									...prev,
									languages: prev.languages.includes(item as string)
										? prev.languages.filter((l) => l !== item)
										: [...prev.languages, item as string]
								}))
							}}
							classNames={{ base: "!mt-0" }}
							icon={true}
						/>
					</div>
				</AccordionItem>
				<AccordionItem
					title="Style"
					key="3"
					classNames={{
						trigger: "pb-0",
						title:
							"font-semibold text-sm leading-[24px] tracking-[-0.01em] text-textPrimary"
					}}
				>
					<SearchBar
						placeholder="Search"
						className="mt-2"
						onChange={(e) => setSearchQuerySkills(e.target.value)}
					/>
					<div className="flex flex-wrap gap-2 mt-2">
						<SelectableOptions
							data={genres.filter((genre) =>
								genre.title
									.toLowerCase()
									.includes(searchQuerySkills.toLowerCase())
							)}
							selectedItems={localFilter.style}
							onItemChange={(item: string | Language) => {
								setLocalFilter((prev) => ({
									...prev,
									style: prev.style.includes(item as string)
										? prev.style.filter((s) => s !== item)
										: [...prev.style, item as string]
								}))
							}}
							classNames={{ base: "!mt-0" }}
							icon={true}
						/>
					</div>
				</AccordionItem>
			</Accordion>
			<div className="flex flex-col mt-4 gap-2">
				<span className="font-semibold text-sm leading-[24px] tracking-[-0.01em] text-textPrimary">
					Collaboration Opportunity
				</span>
				<RadioGroup
					value={localFilter.collaborateWith}
					onValueChange={(value) =>
						setLocalFilter((prev) => ({
							...prev,
							collaborateWith: value as "ARTISTS" | "FANS"
						}))
					}
					orientation="horizontal"
					classNames={{
						wrapper: "flex !flex-col justify-center gap-4"
					}}
				>
					<Radio
						value="ARTISTS"
						color="success"
						classNames={{
							base: cn(
								"flex-row-reverse cursor-pointer justify-between w-full !max-w-full"
							),
							label:
								"font-medium text-sm leading-[24px] tracking-[-0.01em] text-textPrimary"
						}}
					>
						Artists
					</Radio>
					<Radio
						value="FANS"
						color="success"
						classNames={{
							base: cn(
								"flex flex-col justify-between w-full",
								"flex-row-reverse cursor-pointer justify-between w-full !max-w-full"
							),
							label:
								"font-medium text-sm leading-[24px] tracking-[-0.01em] text-textPrimary"
						}}
					>
						Fans
					</Radio>
				</RadioGroup>
			</div>
			<div className="flex flex-col justify-center items-center self-center mt-4 w-full text-sm tracking-normal leading-6 max-w-[291px] text-slate-500">
				<Button
					className="w-full px-4 py-2 bg-green-100 rounded-xl"
					onPress={handleApplyFilters}
				>
					Apply Filters
				</Button>
				<Button
					className="w-full px-4 py-2 mt-1 bg-white rounded-xl border border-green-100 border-solid"
					onPress={handleClearFilters}
				>
					Clear Filters
				</Button>
			</div>
		</div>
	)
}
