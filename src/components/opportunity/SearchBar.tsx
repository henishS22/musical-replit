"use client"

import React from "react"
import Image from "next/image"

import { SEARCH_ICON } from "@/assets"

interface SearchBarProps {
	placeholder: string
	className?: string
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const SearchBar: React.FC<SearchBarProps> = ({
	placeholder,
	className,
	onChange
}) => {
	return (
		<div
			className={`flex flex-wrap gap-2 items-center p-3 max-w-full rounded-lg border-2 border-solid border-zinc-100 w-[1042px] ${className}`}
		>
			<Image
				src={SEARCH_ICON}
				alt="search-icon"
				className="object-contain shrink-0 self-stretch my-auto w-4 aspect-square"
				height={16}
				width={16}
			/>
			<input
				type="text"
				placeholder={placeholder}
				className="flex-1 shrink self-stretch my-auto basis-0 max-md:max-w-full text-xs font-medium tracking-normal text-gray-500 bg-transparent border-none outline-none"
				onChange={onChange}
			/>
		</div>
	)
}
