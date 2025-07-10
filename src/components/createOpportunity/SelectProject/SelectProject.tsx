import { useEffect, useMemo, useState } from "react"
import { useFormContext } from "react-hook-form"
import { useInView } from "react-intersection-observer"
import { useRouter } from "next/navigation"

import { fetchLang, fetchProjectList, fetchUsedProject } from "@/app/api/query"
import ProjectCard from "@/components/createOpportunity/projectCard"
import { CustomInput, TitleBadgeCard } from "@/components/ui"
import { generateQueryParams } from "@/helpers"
import { Language } from "@/types/createOpportunityTypes"
import { ProjectResponse } from "@/types/dashboarApiTypes"
import { Button, Spinner } from "@nextui-org/react"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { SearchIcon } from "lucide-react"

import { useDynamicStore, useUserStore } from "@/stores"
import { useDebounce } from "@/hooks/useDebounce"

import CollaborationSection from "../CollaborationSection"
import SelectableOptions from "../ProjectNeeds/SelectableOptions"

interface SelectProjectProps {
	title: string
	markColor: string
	label: string
	placeholder: string
}

const SelectProject = ({
	title,
	markColor,
	label,
	placeholder
}: SelectProjectProps) => {
	const { CreateOpportunity, engageFlow, updateState, addState, removeState } =
		useDynamicStore()
	const [search, setSearch] = useState<string>("")
	const { user } = useUserStore()
	const router = useRouter()
	const {
		setValue,
		formState: { errors }
	} = useFormContext()
	const searchQuery = useDebounce(search, 1000)

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isPending: isProjectLoading
	} = useInfiniteQuery({
		queryKey: ["projectList", searchQuery],
		queryFn: ({ pageParam = 1 }) =>
			fetchProjectList(
				user?.id ?? "",
				generateQueryParams({
					visibility: "all",
					page: pageParam.toString(),
					limit: "10",
					onlyOwner: "true",
					...(searchQuery && { search: searchQuery })
				})
			),
		initialPageParam: 1,
		getNextPageParam: (lastPage, allPages) => {
			const totalItems = lastPage?.pagination?.total || 0
			const currentPage = allPages?.length
			return currentPage * 10 < totalItems ? currentPage + 1 : undefined
		},
		staleTime: 20000,
		enabled: Boolean(user?.id && title === "Select a Project")
	})

	const projectData = useMemo(() => {
		return data?.pages.flatMap((page) => page?.projects ?? []) || []
	}, [data])

	const { ref: loadMoreRef, inView } = useInView()

	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage()
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

	const { data: languages } = useQuery({
		queryKey: ["languages"],
		queryFn: fetchLang,
		staleTime: 20000
	})

	const { data: usedProject } = useQuery({
		queryKey: ["usedProject"],
		queryFn: fetchUsedProject,
		staleTime: 20000
	})

	const handleProjectSelect = (project: ProjectResponse) => {
		setValue("selectedProject", project, { shouldDirty: true })
		updateState("CreateOpportunity", {
			...CreateOpportunity,
			selectedProject: project
		})
	}

	const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newTitle = e?.target?.value || ""
		setSearch(newTitle)
		if (title === "Basic Info") {
			setValue("title", newTitle, { shouldDirty: true })
			updateState("CreateOpportunity", {
				...CreateOpportunity,
				title: newTitle
			})
		}
	}

	const handleLanguageSelect = (value: Language) => {
		const newSelectedLanguages = CreateOpportunity?.languages?.includes(value)
			? CreateOpportunity?.languages?.filter(
					(l: Language) => l?._id !== value?._id
				)
			: [...CreateOpportunity.languages, value]

		setValue("languages", newSelectedLanguages, { shouldDirty: true })
		updateState("CreateOpportunity", {
			languages: newSelectedLanguages,
			languagesId: newSelectedLanguages?.map((lang: Language) => lang?._id)
		})
	}

	useEffect(() => {
		// Handle title and search
		if (CreateOpportunity?.title && CreateOpportunity?.currentStep === 1) {
			setSearch(CreateOpportunity?.title)
			setValue("title", CreateOpportunity?.title)
		} else {
			setSearch("")
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [CreateOpportunity?.currentStep])

	useEffect(() => {
		// Handle languages
		if (!CreateOpportunity?.languages && CreateOpportunity?.currentStep === 1) {
			setValue("languages", [])
			updateState("CreateOpportunity", {
				languages: [],
				languagesId: []
			})
		} else {
			setValue("languages", CreateOpportunity?.languages)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [CreateOpportunity?.currentStep])

	useEffect(() => {
		if (CreateOpportunity?.selectedProject) {
			setValue("selectedProject", CreateOpportunity?.selectedProject)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [CreateOpportunity?.selectedProject])

	return (
		<TitleBadgeCard title={title} markColor={markColor} titleClassName="!mb-0">
			<div className={`${title === "Select a Project" ? "" : "px-4 py-2"}`}>
				<div className="flex flex-col mt-8 w-full max-md:max-w-full gap-8">
					{engageFlow && title === "Basic Info" && <CollaborationSection />}
					<div>
						<CustomInput
							value={search}
							onChange={handleTitleChange}
							label={label}
							type="text"
							placeholder={placeholder}
							classname={`border-2 ${title === "Select a Project" ? "!border-blueBorder" : "!border-hoverGray"} max-w-[580px]`}
							rounded="rounded-lg"
							labelClassName="font-bold text-[14px] leading-[21px] tracking-[-1.5%] text-inputLabel"
							startContent={
								title === "Select a Project" ? (
									<SearchIcon className="text-gray-500" size={16} />
								) : null
							}
						/>
						{title === "Basic Info" && (
							<div className="text-[10px] leading-[15px] tracking-[-0.015em] font-normal text-textGray">
								<p className="mt-1">For Example</p>
								<ul className="list-disc ml-2 [&>li]:ml-3">
									<li className="">
										Looking for a fan to sing the hook on my new track
									</li>
									<li>Need poster made for my upcoming tour</li>
									<li>I&apos;m hosting a remix contest</li>
								</ul>
							</div>
						)}
					</div>
					<div className="flex flex-col max-h-[300px] overflow-auto scrollbar">
						{title === "Select a Project" ? (
							isProjectLoading ? (
								<div className="h-[238px] w-full flex justify-center items-center">
									<Spinner size="lg" color="default" />
								</div>
							) : projectData?.length > 0 ? (
								<>
									<div className="grid grid-cols-[repeat(auto-fill,minmax(218px,1fr))] gap-4">
										{projectData?.map((project) => (
											<ProjectCard
												key={project?._id}
												project={project}
												onSelect={() => handleProjectSelect(project)}
												isSelected={
													CreateOpportunity?.selectedProject?._id ===
													project?._id
												}
												isUsedProject={usedProject?.includes(project?._id)}
											/>
										))}
									</div>
									<div
										ref={loadMoreRef}
										className="w-full flex justify-center mt-4"
									>
										{isFetchingNextPage && (
											<Spinner
												size="lg"
												color="default"
												className="flex items-center justify-center h-[50px]"
											/>
										)}
									</div>
								</>
							) : (
								<div className="h-[238px] w-full flex flex-col justify-center items-center gap-4">
									<p className="text-sm font-medium text-gray-500 leading-normal">
										You don&apos;t have a project yet. Create a new project to
										get started!
									</p>
									<Button
										className="font-bold rounded-md px-5 py-3 text-[15px] transition-colors bg-videoBtnGreen text-[#0D5326]"
										onPress={() => {
											addState("opportunity", true)
											removeState("collabData")
											removeState("trackId")
											router.push("/create-project")
										}}
									>
										Create a Project
									</Button>
								</div>
							)
						) : (
							<SelectableOptions
								data={languages || []}
								selectedItems={CreateOpportunity?.languagesId || []}
								onItemChange={(value) =>
									handleLanguageSelect(value as Language)
								}
								label="Language"
								note="Select the languages that will be used on your project."
								sendWholeItem
								icon
							/>
						)}
					</div>
					{(errors?.title?.message ||
						errors?.languages?.message ||
						errors?.selectedProject?.message) && (
						<p className="text-red-500 text-sm mt-1">
							{errors?.title?.message?.toString() ||
								errors?.languages?.message?.toString() ||
								errors?.selectedProject?.message?.toString()}
						</p>
					)}
				</div>
			</div>
		</TitleBadgeCard>
	)
}

export default SelectProject
