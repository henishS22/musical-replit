"use client"

import React, {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useState
} from "react"
import { Controller, useForm, UseFormSetValue } from "react-hook-form"
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"

import { updateUser } from "@/app/api/mutation"
import {
	fetchCityList,
	fetchCountryList,
	fetchLocalization,
	fetchStateList
} from "@/app/api/query"
import { PROFILE_IMAGE } from "@/assets"
import { CustomInput, TitleBadgeCard } from "@/components/ui"
import CategoryAttributes from "@/components/ui/categoryandatrribute/CategoryAttributes"
import CustomTooltip from "@/components/ui/tooltip"
// import { removeEmptyValues } from "@/helpers"
import { profileSchema } from "@/validationSchema/ProfileSchema"
import { UploadFormData } from "@/validationSchema/UploadWorkSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { useLibraryStore, useUserStore } from "@/stores"

import ProfilePicture from "./ProfilePicture"
import SelectInput from "./SelectInput"
import { StyleAndSkillsFormValues } from "./StyleAndSkills"

export type ProfileFormValues = {
	name: string
	username: string
	descr: string
	country?: string
	state?: string
	city?: string
	spotify: string
	apple_music: string
	youtube: string
	instagram: string
	tiktok: string
	twitter: string
	clb_interest: string[]
	clb_setup: string[]
	clb_availability: string
}

interface ChildFormRef {
	submitForm: () => void
}

const ProfilePage = forwardRef<ChildFormRef>((_, ref) => {
	const router = useRouter()
	const { instruments, genres } = useLibraryStore()
	const { userData } = useUserStore()

	const [location, setLocation] = useState<{
		country: string
		state: string
		city: string
	}>({
		country: "",
		state: "",
		city: ""
	})

	const { data: localization } = useQuery({
		queryKey: ["localization"],
		queryFn: () => fetchLocalization(userData?._id || ""),
		enabled: !!userData?._id
	})

	const defaultValues = {
		name: userData?.name || "",
		username: userData?.username || "",
		descr: userData?.descr || "",
		country: location?.country || "",
		state: location?.state || "",
		city: location?.city || "",
		spotify: userData?.spotify || "",
		apple_music: userData?.apple_music || "",
		youtube: userData?.youtube || "",
		instagram: userData?.instagram || "",
		tiktok: userData?.tiktok || "",
		twitter: userData?.twitter || "",
		clb_interest: (userData?.clb_interest || []).map((item) => item._id),
		clb_setup: (userData?.clb_setup || []).map((item) => item._id),
		clb_availability: userData?.clb_availability || ""
	}

	const {
		control,
		handleSubmit,
		getValues,
		setValue,
		formState: { errors }
	} = useForm<ProfileFormValues>({
		defaultValues,
		resolver: zodResolver(profileSchema)
	})

	const [instrumentsData, setInstrumentsData] = useState<
		{ label: string; value: string }[]
	>([])
	const [genresData, setGenresData] = useState<
		{ label: string; value: string }[]
	>([])

	useEffect(() => {
		if (instruments.length) {
			const instrumentData = instruments.map((instrument) => ({
				label: instrument.title,
				value: instrument._id
			}))
			setInstrumentsData(instrumentData)
		}

		if (genres.length) {
			const genreData = genres.map((genre) => ({
				label: genre.title,
				value: genre._id
			}))
			setGenresData(genreData)
		}
	}, [instruments, genres])

	const options = [
		{
			key: "weekly-collabs",
			label: "Weekly Collabs"
		},
		{
			key: "monthly-collabs",
			label: "Monthly Collabs"
		},
		{
			key: "yearly-collabs",
			label: "Yearly Collabs"
		}
	]

	const queryClient = useQueryClient()

	const { data: countryList } = useQuery({
		queryKey: ["countryList"],
		queryFn: fetchCountryList
	})

	const { data: stateList } = useQuery({
		queryKey: ["stateList", location.country],
		queryFn: () => fetchStateList(location.country),
		enabled: !!location.country
	})

	const { data: cityList } = useQuery({
		queryKey: ["cityList", location.state],
		queryFn: () => fetchCityList(location.state),
		enabled: !!location.state
	})

	const { mutate: updateUserMutation } = useMutation({
		mutationFn: (payload: {
			data: ProfileFormValues | Record<string, string> | FormData
			url: string
		}) => updateUser(payload.data, payload.url),

		onSuccess: (data) => {
			if (data) {
				toast.success("Profile updated successfully")
				queryClient.invalidateQueries({ queryKey: ["userData"] })
				queryClient.invalidateQueries({ queryKey: ["localization"] })
				router.push("/profile")
			}
		},
		onError: () => {
			toast.error("Failed to update profile")
		}
	})

	useImperativeHandle(ref, () => ({
		submitForm: handleSubmit((data) => {
			// const cleanedValues = removeEmptyValues(data)

			const cleanedValues = {
				...data
			}

			if (!location.city.length) {
				delete cleanedValues.city
			}

			if (!location.state.length) {
				delete cleanedValues.state
			}

			if (!location.country.length) {
				delete cleanedValues.country
			}

			updateUserMutation({ data: cleanedValues, url: "" })
			if (location.city) {
				const locationPayload = {
					cityId: location.city
				}
				updateUserMutation({ data: locationPayload, url: "localization" })
			}
		})
	}))

	useEffect(() => {
		if (localization) {
			setLocation({
				country: localization.country._id,
				state: localization.state._id,
				city: localization.city._id
			})
			setValue("country", localization.country._id)
			setValue("state", localization.state._id)
			setValue("city", localization.city._id)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [localization])

	return (
		<form>
			<main>
				<TitleBadgeCard
					markColor="#CABDFF"
					title="Profile information"
					titleClassName="!mb-0"
				>
					<ProfilePicture
						imageUrl={userData?.profile_img || PROFILE_IMAGE.src}
					/>

					<div className="mb-8">
						<Controller
							name="name"
							control={control}
							render={({ field }) => (
								<CustomInput
									label="NAME"
									type="text"
									id="name"
									value={field.value}
									onChange={field.onChange}
									classname="bg-zinc-100 text-sm font-semibold text-neutral-700"
									showTooltip
									tooltipText="Your full name"
								/>
							)}
						/>
					</div>

					<div className="mb-8">
						<Controller
							name="username"
							control={control}
							render={({ field }) => (
								<CustomInput
									label="Username"
									type="text"
									id="username"
									value={field.value}
									onChange={field.onChange}
									classname="bg-zinc-100 text-sm font-semibold text-neutral-700"
									showTooltip
									tooltipText="Your username"
								/>
							)}
						/>
					</div>

					<div className="mb-8">
						<Controller
							name="descr"
							control={control}
							render={({ field }) => (
								<CustomInput
									label="Description"
									type="textarea"
									id="descr"
									value={field.value || ""}
									onChange={field.onChange}
									classname="bg-zinc-100 text-sm font-semibold text-neutral-700"
									showTooltip
									tooltipText="Your description"
								/>
							)}
						/>
					</div>

					<div className="mb-8 flex gap-8">
						{/* <SelectInput
							label="Country"
							placeholder="Select a country"
							options={
								countryList?.map(
									(country: { _id: string; name: { english: string } }) => ({
										key: country._id,
										label: country.name.english
									})
								) || []
							}
							onChange={(value) => {
								setLocation((prev) => ({ ...prev, country: value }))
								setValue("country", value)
							}}
							value={location.country || field.value}
						/> */}
						<Controller
							name="country"
							control={control}
							render={({ field }) => (
								<SelectInput
									label="Country"
									placeholder="Select a country"
									options={
										countryList?.map(
											(country: {
												_id: string
												name: { english: string }
											}) => ({
												key: country._id,
												label: country.name.english
											})
										) || []
									}
									onChange={(value) => {
										setLocation((prev) => ({ ...prev, country: value }))
										setValue("country", value)
									}}
									value={location.country || field.value}
								/>
							)}
						/>

						{/* <SelectInput
							label="State"
							placeholder="Select a state"
							options={
								stateList?.map((state: { _id: string; name: string }) => ({
									key: state._id,
									label: state.name
								})) || []
							}
							onChange={(value) => {
								setLocation((prev) => ({ ...prev, state: value }))
								setValue("state", value)
							}}
							value={location.state}
						/> */}
						<Controller
							name="state"
							control={control}
							render={({ field }) => (
								<SelectInput
									label="State"
									placeholder="Select a state"
									options={
										stateList?.map((state: { _id: string; name: string }) => ({
											key: state._id,
											label: state.name
										})) || []
									}
									onChange={(value) => {
										setLocation((prev) => ({ ...prev, state: value }))
										setValue("state", value)
									}}
									value={location.state || field.value}
								/>
							)}
						/>
					</div>

					{/* <SelectInput
						label="City"
						placeholder="Select a city"
						options={
							cityList?.map((city: { _id: string; name: string }) => ({
								key: city._id,
								label: city.name
							})) || []
						}
						onChange={(value) => {
							setLocation((prev) => ({ ...prev, city: value }))
							setValue("city", value)
						}}
						value={location.city}
					/> */}

					<Controller
						name="city"
						control={control}
						render={({ field }) => (
							<SelectInput
								label="City"
								placeholder="Select a city"
								options={
									cityList?.map((city: { _id: string; name: string }) => ({
										key: city._id,
										label: city.name
									})) || []
								}
								onChange={(value) => {
									setLocation((prev) => ({ ...prev, city: value }))
									setValue("city", value)
								}}
								value={location.city || field.value}
							/>
						)}
					/>
				</TitleBadgeCard>
				<div className="mx-0 h-px bg-zinc-100" />
				<TitleBadgeCard
					markColor="#CABDFF"
					title="Collaboration Interests"
					titleClassName="!mb-0"
				>
					<CategoryAttributes
						title="What you play"
						categories={instrumentsData}
						tooltipContent="Select the instruments that you play"
						setValue={
							setValue as UseFormSetValue<
								ProfileFormValues | UploadFormData | StyleAndSkillsFormValues
							>
						}
						name="clb_interest"
						getValues={() => getValues("clb_interest")}
						error={errors.clb_interest?.message || ""}
					/>

					<CategoryAttributes
						title="Genres Interest"
						categories={genresData}
						tooltipContent="Select the genres that describe your work"
						setValue={
							setValue as UseFormSetValue<
								ProfileFormValues | UploadFormData | StyleAndSkillsFormValues
							>
						}
						name="clb_setup"
						getValues={() => getValues("clb_setup")}
						error={errors.clb_setup?.message || ""}
					/>

					<div className="mt-8">
						<div className="flex items-center gap-2 mb-4">
							<h2 className="text-sm font-semibold text-[#33383F]">
								Time Availability (Optional)
							</h2>
							<CustomTooltip tooltipContent="Select the time availability for collaboration" />
						</div>
						<Controller
							name="clb_availability"
							control={control}
							render={({ field }) => (
								<SelectInput
									placeholder="Select time availability"
									options={options.map((option) => ({
										key: option.key,
										label: option.label
									}))}
									onChange={(value) => {
										field.onChange(value)
									}}
									value={field.value}
								/>
							)}
						/>
					</div>
				</TitleBadgeCard>
				<div className="mx-0 h-px bg-zinc-100" />
				<TitleBadgeCard
					markColor="#CABDFF"
					title="Social Media"
					titleClassName="!mb-0"
				>
					<div className="my-8 flex gap-8">
						<Controller
							name="spotify"
							control={control}
							render={({ field }) => (
								<CustomInput
									label="Spotify"
									showTooltip
									tooltipText="Your Spotify profile"
									type="text"
									id="spotify"
									value={field.value}
									onChange={field.onChange}
									classname="bg-zinc-100 text-sm font-semibold text-neutral-700"
									mainWrapperClassName="w-1/2"
									errorMessage={errors.spotify?.message || ""}
									isInvalid={!!errors.spotify?.message}
								/>
							)}
						/>

						<Controller
							name="apple_music"
							control={control}
							render={({ field }) => (
								<CustomInput
									label="Apple"
									showTooltip
									tooltipText="Your Apple Music profile"
									type="text"
									id="apple_music"
									value={field.value}
									onChange={field.onChange}
									classname="bg-zinc-100 text-sm font-semibold text-neutral-700"
									mainWrapperClassName="w-1/2"
									errorMessage={errors.apple_music?.message || ""}
									isInvalid={!!errors.apple_music?.message}
								/>
							)}
						/>
					</div>

					<div className="mb-8 flex gap-8">
						<Controller
							name="youtube"
							control={control}
							render={({ field }) => (
								<CustomInput
									label="Youtube"
									showTooltip
									tooltipText="Your YouTube channel"
									type="text"
									id="youtube"
									value={field.value}
									onChange={field.onChange}
									classname="bg-zinc-100 text-sm font-semibold text-neutral-700"
									mainWrapperClassName="w-1/2"
									errorMessage={errors.youtube?.message || ""}
									isInvalid={!!errors.youtube?.message}
								/>
							)}
						/>

						<Controller
							name="instagram"
							control={control}
							render={({ field }) => (
								<CustomInput
									label="Instagram"
									showTooltip
									tooltipText="Your Instagram profile"
									type="text"
									id="instagram"
									value={field.value}
									onChange={field.onChange}
									classname="bg-zinc-100 text-sm font-semibold text-neutral-700"
									mainWrapperClassName="w-1/2"
									errorMessage={errors.instagram?.message || ""}
									isInvalid={!!errors.instagram?.message}
								/>
							)}
						/>
					</div>

					<div className="mb-8 flex gap-8">
						<Controller
							name="tiktok"
							control={control}
							render={({ field }) => (
								<CustomInput
									label="TikTok"
									showTooltip
									tooltipText="Your TikTok profile"
									type="text"
									id="tiktok"
									value={field.value}
									onChange={field.onChange}
									classname="bg-zinc-100 text-sm font-semibold text-neutral-700"
									mainWrapperClassName="w-1/2"
									errorMessage={errors.tiktok?.message || ""}
									isInvalid={!!errors.tiktok?.message}
								/>
							)}
						/>

						<Controller
							name="twitter"
							control={control}
							render={({ field }) => (
								<CustomInput
									label="X"
									type="text"
									id="twitter"
									value={field.value}
									onChange={field.onChange}
									classname="bg-zinc-100 text-sm font-semibold text-neutral-700"
									showTooltip
									tooltipText="Your X (Twitter) profile"
									mainWrapperClassName="w-1/2"
									errorMessage={errors.twitter?.message || ""}
									isInvalid={!!errors.twitter?.message}
								/>
							)}
						/>
					</div>
				</TitleBadgeCard>
			</main>
		</form>
	)
})
ProfilePage.displayName = "ProfilePage"
export default ProfilePage
