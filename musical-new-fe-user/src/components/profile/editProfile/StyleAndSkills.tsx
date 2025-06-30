"use client"

import React, {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useState
} from "react"
import { FormProvider, useForm, UseFormSetValue } from "react-hook-form"
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"

import { updateUser } from "@/app/api/mutation"
import CategoryAttributes from "@/components/ui/categoryandatrribute/CategoryAttributes"
import { TitleBadgeCard } from "@/components/ui/titleBadgeCard"
import { UploadFormData } from "@/validationSchema/UploadWorkSchema"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { useLibraryStore, useUserStore } from "@/stores"

import { ProfileFormValues } from "./PersonalInfo"
import SkillsList from "./SkillsList"

export type StyleAndSkillsFormValues = {
	preferredStyles: string[]
	skills: {
		type: string
		level: string
		typeTitle: string
		levelTitle: string
	}[]
}

export type StyleAndSkillsPayload = {
	preferredStyles: string[]
	skills: {
		type: string
		level: string
	}[]
	username: string
}

interface ChildFormRef {
	submitForm: () => void
}

const StyleAndSkills = forwardRef<ChildFormRef>((_, ref) => {
	const router = useRouter()
	const { genres } = useLibraryStore()
	const { userData } = useUserStore()
	const [genresData, setGenresData] = useState<
		{ label: string; value: string }[]
	>([])

	const queryClient = useQueryClient()
	const methods = useForm<StyleAndSkillsFormValues>({
		defaultValues: {
			preferredStyles: (userData?.preferredStyles || []).map(
				(style) => style._id
			),
			skills: (userData?.skills || []).map((skill) => ({
				type: skill.type._id,
				level: skill.level._id,
				typeTitle: skill.type.title.en,
				levelTitle: skill.level.title.en
			}))
		}
	})

	const { handleSubmit, setValue, getValues } = methods

	useEffect(() => {
		if (genres.length) {
			const genreData = genres.map((genre) => ({
				label: genre.title,
				value: genre._id
			}))
			setGenresData(genreData)
		}
	}, [genres])

	const { mutate: updateUserMutation } = useMutation({
		mutationFn: (payload: { data: StyleAndSkillsPayload; url: string }) =>
			updateUser(payload.data, payload.url),
		onSuccess: (data) => {
			if (data) {
				toast.success("Profile updated successfully")
				queryClient.invalidateQueries({ queryKey: ["userData"] })
				router.push("/profile")
			}
		},
		onError: () => {
			toast.error("Failed to update profile")
		}
	})

	useImperativeHandle(ref, () => ({
		submitForm: handleSubmit((data) => {
			const payload = {
				preferredStyles: data.preferredStyles,
				skills: data.skills.map((skill) => ({
					type: skill.type,
					level: skill.level
				})),
				username: userData?.username || ""
			}
			updateUserMutation({
				data: payload,
				url: ""
			})
		})
	}))

	return (
		<FormProvider {...methods}>
			<form>
				<div className="max-w-[740px]">
					<div className="w-full max-md:max-w-full">
						{/* Header section */}
						<TitleBadgeCard
							markColor="#CABDFF"
							title="Style & Skills"
							titleClassName="!mb-0"
						>
							<CategoryAttributes
								title="Select your Styles"
								categories={genresData}
								tooltipContent="Select the genres that describe your style"
								setValue={
									setValue as UseFormSetValue<
										| UploadFormData
										| ProfileFormValues
										| StyleAndSkillsFormValues
									>
								}
								name="preferredStyles"
								getValues={getValues}
								error={""}
								defaultValue={
									getValues("preferredStyles") ||
									userData?.preferredStyles?.map((style) => style._id)
								}
							/>

							<SkillsList />
						</TitleBadgeCard>
					</div>
				</div>
			</form>
		</FormProvider>
	)
})

StyleAndSkills.displayName = "StyleAndSkills"
export default StyleAndSkills
