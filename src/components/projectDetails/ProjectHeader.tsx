"use client"

import React, { useEffect, useState } from "react"
import { toast } from "react-toastify"
import Image from "next/image"
import { useParams } from "next/navigation"

import { updateProject } from "@/app/api/mutation"
import { GLOBE } from "@/assets"
import { useMutation } from "@tanstack/react-query"

import CustomToggle from "../ui/customToggle"

function ProjectHeader({
	isPublic,
	name,
	isOwner = false
}: {
	isPublic: boolean
	name: string
	isOwner: boolean
}) {
	const [isPublicState, setIsPublicState] = useState(false)

	const params = useParams()
	const id = params.id as string

	const { mutate, isPending } = useMutation({
		mutationFn: (payload: FormData) => updateProject(id, payload),
		onSuccess: () => {
			toast.success("Project updated successfully")
		},
		onError: () => {
			toast.error("Failed to update project")
		}
	})

	const handleUpdateProject = () => {
		setIsPublicState(!isPublicState)
		const formData = new FormData()
		formData.append("isPublic", (!isPublicState).toString())
		mutate(formData)
	}

	useEffect(() => {
		setIsPublicState(isPublic)
	}, [isPublic])

	return (
		<div className="flex flex-col flex-1 shrink self-stretch my-auto basis-0 min-w-[240px] max-md:max-w-full ml-[240px]">
			<div className="flex flex-wrap gap-10 justify-between items-start w-full font-bold max-md:max-w-full">
				<div className="text-3xl tracking-tighter leading-none text-zinc-900 max-md:max-w-full">
					{name}
				</div>
				{/* <div className="flex gap-4 items-center text-base tracking-normal leading-relaxed whitespace-nowrap text-zinc-50">
					<button className="gap-2 self-stretch px-5 py-3 my-auto rounded-xl">
						Edit
					</button>
				</div> */}
			</div>
			<div className="flex flex-wrap gap-3 mt-3 items-center w-full max-md:max-w-full">
				<div className="flex gap-0.5 items-center self-stretch my-auto text-sm font-semibold tracking-tight leading-8 text-zinc-900">
					<Image
						loading="lazy"
						src={GLOBE}
						className="object-contain shrink-0 self-stretch my-auto w-5 aspect-square"
						alt="globe"
						width={16}
						height={16}
					/>
					<div className="self-stretch my-auto">Public View:</div>
				</div>
				<div>
					<CustomToggle
						isActive={isPublicState}
						onClick={handleUpdateProject}
						showTooltip={false}
						className="!gap-0"
						disabled={isPending || !isOwner}
					/>
				</div>
				<div className="self-stretch my-auto text-sm font-medium tracking-tight leading-8 text-gray-500 text-opacity-60">
					Allow public to view the project
				</div>
			</div>
		</div>
	)
}

export default ProjectHeader
