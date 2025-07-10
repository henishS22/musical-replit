"use client"

import React from "react"
import { Calendar } from "react-date-range"
import { FormProvider, useForm } from "react-hook-form"

import {
	fetchCountryList,
	fetchLang,
	fetchTrackMetadata
} from "@/app/api/query"
import { zodResolver } from "@hookform/resolvers/zod"
import {
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Radio,
	RadioGroup
} from "@nextui-org/react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Plus, Trash2 } from "lucide-react"

import "react-date-range/dist/styles.css"
import "react-date-range/dist/theme/default.css"

import { toast } from "react-toastify"
import { useRouter } from "next/navigation"

import { createMetadata, updateMetadata } from "@/app/api/mutation"
import createTrackSchema, {
	CreateTrackFormData
} from "@/validationSchema/CreateTrackSchema"

import { useDynamicStore, useLibraryStore } from "@/stores"
import { useFormNavigationAlert } from "@/hooks/useFormNavigationAlert"

import { ContractTable } from "../createToken/contract/ContractTable"
import ProjectTracksModal from "../modal/ProjectTracksModal"
import { CustomInput } from "../ui/customInput"
import { CustomSingleSelect } from "../ui/customSingleSelect"
import { TitleBadgeCard } from "../ui/titleBadgeCard"
import AddTrackFile from "./AddTrackFile"

const AddIpMetadata = () => {
	const { instruments } = useLibraryStore()
	const router = useRouter()
	const { data: language } = useQuery({
		queryKey: ["language"],
		queryFn: () => fetchLang(),
		staleTime: 1000 * 60 * 60 * 24
	})
	const { data: country } = useQuery({
		queryKey: ["country"],
		queryFn: () => fetchCountryList(),
		staleTime: 1000 * 60 * 60 * 24
	})

	const { tokenProject, trackId, updateState } = useDynamicStore()
	const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false)
	const [selectedDate, setSelectedDate] = React.useState<Date | null>(null)
	const [genre, setGenre] = React.useState<string[]>([])
	const [isSendForRelease, setIsSendForRelease] = React.useState(false)
	const methods = useForm<CreateTrackFormData>({
		defaultValues: {
			track: {
				artist: "",
				language: "",
				trackId: ""
			},
			artist: {
				performerCredit: "",
				writeCredit: "",
				additionalCredit: "",
				role: ""
			},
			trackMetadata: {
				labelName: "",
				copyrightName: "",
				copyrightYear: "",
				countryOfRecording: "",
				trackISRC: "",
				lyrics: ""
			},
			ownership: {
				ownership: false,
				territories: ""
			},
			compositionRights: [
				{
					composerName: "",
					rightsManagement: "",
					percentageOfOwnership: 0
				}
			],
			releaseStatus: {
				previouslyReleased: false,
				upc: "",
				releaseDate: ""
			},
			royalty: [
				{
					userName: "",
					userImage: "",
					splitValue: "",
					walletAddress: "",
					id: ""
				}
			]
		},
		mode: "onBlur",
		reValidateMode: "onChange",
		resolver: zodResolver(createTrackSchema)
	})

	const {
		formState: { errors, isDirty },
		handleSubmit,
		setValue,
		trigger
	} = methods

	// Form Navigation Alert
	useFormNavigationAlert({ formState: { isDirty } })

	const { data: trackMetadata } = useQuery({
		queryKey: ["trackMetadata", trackId?._id],
		queryFn: () => fetchTrackMetadata(trackId?._id),
		enabled: !!trackId
	})

	React.useEffect(() => {
		if (trackId) {
			setValue("track.trackId", trackId.name)
			setGenre(trackId.genre || [])
		}
	}, [trackId, setValue])

	React.useEffect(() => {
		if (trackMetadata) {
			// Track details
			setValue("track.artist", trackMetadata.track.artist)
			setValue("track.language", trackMetadata.track.language)

			// Artist details
			setValue("artist.performerCredit", trackMetadata.artist.performerCredit)
			setValue("artist.writeCredit", trackMetadata.artist.writeCredit)
			setValue("artist.additionalCredit", trackMetadata.artist.additionalCredit)
			setValue("artist.role", trackMetadata.artist.role)
			setGenre(trackMetadata.artist.genre)

			// Track Metadata
			setValue("trackMetadata.labelName", trackMetadata.trackMetadata.labelName)
			setValue(
				"trackMetadata.copyrightName",
				trackMetadata.trackMetadata.copyrightName
			)
			setValue(
				"trackMetadata.copyrightYear",
				trackMetadata.trackMetadata.copyrightYear.toString()
			)
			setValue(
				"trackMetadata.countryOfRecording",
				trackMetadata.trackMetadata.countryOfRecording
			)
			setValue("trackMetadata.trackISRC", trackMetadata.trackMetadata.trackISRC)
			setValue("trackMetadata.lyrics", trackMetadata.trackMetadata.lyrics)

			// Ownership
			setValue("ownership.ownership", trackMetadata.ownership.ownership)
			setValue("ownership.territories", trackMetadata.ownership.territories)

			// Composition Rights
			setValue("compositionRights", trackMetadata.compositionRights)

			// Release Status
			setValue(
				"releaseStatus.previouslyReleased",
				trackMetadata.releaseStatus.previouslyReleased
			)
			setValue("releaseStatus.upc", trackMetadata.releaseStatus.upc)
			setValue(
				"releaseStatus.releaseDate",
				trackMetadata.releaseStatus.releaseDate
			)

			// Set release date in calendar
			if (trackMetadata.releaseStatus.releaseDate) {
				setSelectedDate(new Date(trackMetadata.releaseStatus.releaseDate))
			}

			if (trackMetadata?._id) {
				setIsSendForRelease(true)
			}
			// Collaborators/Royalty
			setValue("royalty", trackMetadata.collaborators)
		}
	}, [trackMetadata, setValue])

	const handleDateSelect = (date: Date) => {
		setSelectedDate(date)
		setValue("releaseStatus.releaseDate", date.toLocaleDateString())
		setIsDatePickerOpen(false)
		trigger("releaseStatus.releaseDate")
	}

	const handleAddCompositionRight = () => {
		const currentRights = methods.getValues("compositionRights")
		methods.setValue("compositionRights", [
			...currentRights,
			{
				composerName: "",
				rightsManagement: "",
				percentageOfOwnership: 0
			}
		])
	}

	const handleDeleteCompositionRight = (index: number) => {
		const currentRights = methods.getValues("compositionRights")
		if (currentRights.length > 1) {
			const updatedRights = currentRights.filter((_, i) => i !== index)
			methods.setValue("compositionRights", updatedRights)
		}
	}

	const mutationFn = (
		data: Record<string, string | string[] | object | boolean>,
		id: string
	) => (trackMetadata?._id ? updateMetadata(data, id) : createMetadata(data))

	const { mutate, isPending } = useMutation({
		mutationFn: (data: Record<string, string | string[] | object | boolean>) =>
			mutationFn(data, trackId?._id as string),
		onSuccess: (data) => {
			if (data) {
				updateState("formNavigation", { isDirty: false })
				if (trackMetadata?._id) {
					toast.success("Track released successfully")
					router.push(`/dashboard`)
				} else {
					toast.success("Track created successfully")
					router.push(`/dashboard`)
				}
			}
		}
	})

	const handleSaveMetadata = (data: CreateTrackFormData) => {
		const { artist, track, royalty, trackMetadata, ...rest } = data

		const emptyWalletAddresses = data.royalty.filter(
			(item) => item.walletAddress.length === 0
		)

		if (emptyWalletAddresses.length > 0) {
			toast.error("Wallet address is required for all royalty recipients")
			return
		}

		const payload = {
			...rest,
			projectId: tokenProject?._id,
			artist: {
				...artist,
				genre: genre
			},
			track: {
				...track,
				trackId: trackId?._id
			},
			trackMetadata: {
				...trackMetadata,
				copyrightYear: Number(trackMetadata.copyrightYear)
			},
			collaborators: royalty
		}
		if (isSendForRelease) {
			payload.isSendForRelease = true
		}
		mutate(payload)
	}

	React.useEffect(() => {
		const firstErrorField = document.getElementsByClassName("text-red-500")[0]
		if (firstErrorField) {
			firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" })
		}
		if (errors.royalty) {
			toast.error("All the royalty members must have a wallet address")
		}
	}, [errors])

	return (
		<FormProvider {...methods}>
			<form onSubmit={handleSubmit(handleSaveMetadata)}>
				<div className="flex flex-col gap-4 mt-[25px]">
					<div className="flex justify-between items-center">
						<div className="font-manrope font-bold text-[20px] leading-[24px] tracking-[-0.01em]">
							Creating a Track
						</div>
					</div>
					<TitleBadgeCard title="Track Details" markColor="#CABDFF">
						<div className="flex gap-6">
							<div className="flex-1">
								<CustomInput
									label="Artist"
									type="text"
									placeholder="Enter Artist Name"
									{...methods.register("track.artist")}
									isInvalid={!!errors.track?.artist}
									errorMessage={errors.track?.artist?.message}
								/>
								<div className="mt-4" />
								<CustomInput
									label="Track Name"
									type="text"
									placeholder="Music_@.mp3"
									{...methods.register("track.trackId")}
									isInvalid={!!errors.track?.trackId}
									errorMessage={errors.track?.trackId?.message}
									disabled={true}
								/>
							</div>
							<div className="flex-1">
								<AddTrackFile />
								<div className="mt-9" />
								<CustomSingleSelect
									label="Track Language"
									options={
										language
											? language?.map((item) => ({
													key: item._id,
													label: item.title
												}))
											: []
									}
									placement="outside"
									variant="bordered"
									placeholder="Select"
									selectedValue={
										methods.watch("track.language")
											? [methods.watch("track.language")]
											: []
									}
									{...methods.register("track.language")}
									isInvalid={!!errors.track?.language}
									errorMessage={errors.track?.language?.message}
								/>
							</div>
						</div>
					</TitleBadgeCard>

					<TitleBadgeCard title="Artist and Credits" markColor="#CABDFF">
						<div className="flex gap-6">
							<div className="flex-1">
								<CustomInput
									label="Performer Credits"
									type="text"
									placeholder="Enter Name"
									{...methods.register("artist.performerCredit")}
									isInvalid={!!errors.artist?.performerCredit}
									errorMessage={errors.artist?.performerCredit?.message}
								/>
								<div className="mt-4" />
								<CustomInput
									label="Write credit (only fullname)"
									type="text"
									placeholder="Enter Name"
									{...methods.register("artist.writeCredit")}
									isInvalid={!!errors.artist?.writeCredit}
									errorMessage={errors.artist?.writeCredit?.message}
								/>
							</div>
							<div className="flex-1">
								<CustomSingleSelect
									label="Role"
									options={instruments?.map(
										(item: { _id: string; title: string }) => ({
											key: item._id,
											label: item.title
										})
									)}
									placement="outside"
									variant="bordered"
									placeholder="Select Role"
									selectedValue={
										methods.watch("artist.role")
											? [methods.watch("artist.role")]
											: []
									}
									{...methods.register("artist.role")}
									isInvalid={!!errors.artist?.role}
									errorMessage={errors.artist?.role?.message}
								/>
								<div className="mt-4" />
								<CustomInput
									label="Additional Credits if needed (optional)"
									type="text"
									placeholder="Add credits"
									{...methods.register("artist.additionalCredit")}
								/>
							</div>
						</div>
					</TitleBadgeCard>

					<TitleBadgeCard
						markColor="#B1E5FC"
						title="Contract and splits"
						titleClassName="!mb-0"
					>
						<ContractTable setValue={setValue} />
					</TitleBadgeCard>

					<TitleBadgeCard
						title="Metadata of the track uploaded"
						markColor="#CABDFF"
					>
						<div className="flex gap-6">
							<div className="flex-1">
								<CustomInput
									label="Label name (if not existing then mention Independent)"
									type="text"
									placeholder="Enter Label name"
									{...methods.register("trackMetadata.labelName")}
									isInvalid={!!errors.trackMetadata?.labelName}
									errorMessage={errors.trackMetadata?.labelName?.message}
								/>
								<div className="mt-9" />
								<CustomSingleSelect
									label="Copyright Year"
									options={Array.from(
										{ length: new Date().getFullYear() - 1900 + 1 },
										(_, i) => ({
											key: (1900 + i).toString(),
											label: (1900 + i).toString()
										})
									).reverse()}
									placement="outside"
									variant="bordered"
									placeholder="Select Year"
									{...methods.register("trackMetadata.copyrightYear")}
									isInvalid={!!errors.trackMetadata?.copyrightYear}
									errorMessage={errors.trackMetadata?.copyrightYear?.message}
									selectedValue={
										methods.watch("trackMetadata.copyrightYear")
											? [methods.watch("trackMetadata.copyrightYear")]
											: []
									}
								/>
								<div className="mt-9" />
								<CustomSingleSelect
									label="Country of Recording"
									options={
										country
											? country?.map(
													(item: {
														_id: string
														name: { english: string }
													}) => ({
														key: item._id,
														label: item.name.english
													})
												)
											: []
									}
									placement="outside"
									variant="bordered"
									placeholder="Select"
									selectedValue={
										methods.watch("trackMetadata.countryOfRecording")
											? [methods.watch("trackMetadata.countryOfRecording")]
											: []
									}
									{...methods.register("trackMetadata.countryOfRecording")}
									isInvalid={!!errors.trackMetadata?.countryOfRecording}
									errorMessage={
										errors.trackMetadata?.countryOfRecording?.message
									}
								/>
							</div>
							<div className="flex-1">
								<CustomInput
									label="Copyright name (owner)"
									type="text"
									placeholder="Enter Name"
									{...methods.register("trackMetadata.copyrightName")}
									isInvalid={!!errors.trackMetadata?.copyrightName}
									errorMessage={errors.trackMetadata?.copyrightName?.message}
								/>
								<div className="mt-3" />
								<CustomInput
									label="Track ISRC (if not existing then mention Independent)"
									type="text"
									placeholder="Enter ISRC"
									{...methods.register("trackMetadata.trackISRC")}
									isInvalid={!!errors.trackMetadata?.trackISRC}
									errorMessage={errors.trackMetadata?.trackISRC?.message}
								/>
								<div className="mt-3" />
								<CustomInput
									label="Lyrics"
									type="text"
									placeholder="Write or Paste "
									{...methods.register("trackMetadata.lyrics")}
									isInvalid={!!errors.trackMetadata?.lyrics}
									errorMessage={errors.trackMetadata?.lyrics?.message}
								/>
							</div>
						</div>
					</TitleBadgeCard>

					<TitleBadgeCard title="Ownership and Assertion" markColor="#CABDFF">
						<div className="flex gap-6">
							<div className="flex-1">
								<RadioGroup
									label="Confirm Ownership(Own and controlling rights)"
									defaultValue={
										methods.watch("ownership.ownership") ? "yes" : "no"
									}
									value={methods.watch("ownership.ownership") ? "yes" : "no"}
									onChange={(e) => {
										setValue("ownership.ownership", e.target.value === "yes")
									}}
								>
									<Radio value="yes">Yes</Radio>
									<Radio value="no">No</Radio>
								</RadioGroup>
							</div>
							<div className="flex-1">
								<CustomInput
									label="Territories"
									type="text"
									placeholder="Enter territories"
									{...methods.register("ownership.territories")}
									isInvalid={!!errors.ownership?.territories}
									errorMessage={errors.ownership?.territories?.message}
								/>
							</div>
						</div>
					</TitleBadgeCard>

					<TitleBadgeCard
						title="Composition Rights"
						markColor="#CABDFF"
						subComponent={
							<div
								className="flex items-center gap-2 text-[#1DB954] bg-[#DDF5E5] px-2 py-1 rounded-md cursor-pointer"
								onClick={handleAddCompositionRight}
							>
								<Plus size={16} color="#1DB954" strokeWidth={1.5} /> Add
							</div>
						}
					>
						{methods
							.watch("compositionRights")
							?.map((_: unknown, index: number) => (
								<div key={index} className="flex gap-6 mb-4">
									<div className="flex-1">
										<CustomInput
											label="Composer Name"
											type="text"
											placeholder="Enter Name"
											{...methods.register(
												`compositionRights.${index}.composerName`
											)}
											isInvalid={
												!!errors.compositionRights?.[index]?.composerName
											}
											errorMessage={
												errors.compositionRights?.[index]?.composerName?.message
											}
										/>
										<div className="mt-4" />
										<CustomInput
											label="Rights management"
											type="text"
											placeholder="Enter Name"
											{...methods.register(
												`compositionRights.${index}.rightsManagement`
											)}
											isInvalid={
												!!errors.compositionRights?.[index]?.rightsManagement
											}
											errorMessage={
												errors.compositionRights?.[index]?.rightsManagement
													?.message
											}
										/>
									</div>
									<div className="flex-1">
										<div className="flex items-center gap-2">
											<CustomInput
												label="Percentage of Ownership"
												type="number"
												min="0"
												max="100"
												placeholder="Enter Value (0-100)"
												{...methods.register(
													`compositionRights.${index}.percentageOfOwnership`,
													{
														valueAsNumber: true,
														validate: (value) =>
															Number(value) <= 100 ||
															"Percentage must be less than or equal to 100",
														onChange: () => {
															methods.trigger(
																`compositionRights.${index}.percentageOfOwnership`
															)
														}
													}
												)}
												isInvalid={
													!!errors.compositionRights?.[index]
														?.percentageOfOwnership
												}
												errorMessage={
													errors.compositionRights?.[index]
														?.percentageOfOwnership?.message
												}
											/>
											{index > 0 && (
												<Button
													isIconOnly
													className="bg-red-100 text-red-500 mt-7"
													onClick={() => handleDeleteCompositionRight(index)}
												>
													<Trash2 size={16} />
												</Button>
											)}
										</div>
									</div>
								</div>
							))}
					</TitleBadgeCard>

					<TitleBadgeCard title="Release Status" markColor="#CABDFF">
						<div>
							<RadioGroup
								label="Has this been previously released?"
								defaultValue={
									methods.watch("releaseStatus.previouslyReleased")
										? "yes"
										: "no"
								}
								value={
									methods.watch("releaseStatus.previouslyReleased")
										? "yes"
										: "no"
								}
								onChange={(e) => {
									setValue(
										"releaseStatus.previouslyReleased",
										e.target.value === "yes"
									)
								}}
							>
								<Radio value="yes">Yes</Radio>
								<Radio value="no">No</Radio>
							</RadioGroup>
						</div>
						<div className="flex gap-6 mt-6">
							<CustomInput
								label="UPC(Universal Product Code)"
								type="text"
								placeholder="Enter UPC"
								mainWrapperClassName="flex-1"
								{...methods.register("releaseStatus.upc")}
								isInvalid={!!errors.releaseStatus?.upc}
								errorMessage={errors.releaseStatus?.upc?.message}
							/>
							<div className="flex-1 ">
								<CustomInput
									label="Release Date"
									type="text"
									placeholder="DD/MM/YYYY"
									value={selectedDate ? selectedDate.toLocaleDateString() : ""}
									onClick={() => setIsDatePickerOpen(true)}
									readOnly
									{...methods.register("releaseStatus.releaseDate")}
									isInvalid={!!errors.releaseStatus?.releaseDate}
									errorMessage={errors.releaseStatus?.releaseDate?.message}
								/>
								<Modal
									isOpen={isDatePickerOpen}
									onOpenChange={setIsDatePickerOpen}
									classNames={{
										backdrop: "bg-[#F4F4F4]/90 z-60",
										wrapper: "z-60",
										base: "max-w-fit",
										body: "p-3"
									}}
									size="xl"
								>
									<ModalContent>
										{(onClose) => (
											<>
												<ModalHeader>Select Release Date</ModalHeader>
												<ModalBody>
													<Calendar
														date={selectedDate || new Date()}
														onChange={handleDateSelect}
														color="#1DB954"
														className="border-none"
														minDate={new Date(Date.now() + 86400000)}
													/>
												</ModalBody>
												<ModalFooter>
													<Button
														color="danger"
														variant="light"
														onPress={onClose}
													>
														Cancel
													</Button>
												</ModalFooter>
											</>
										)}
									</ModalContent>
								</Modal>
							</div>
						</div>
					</TitleBadgeCard>

					<div className="flex justify-end mt-6">
						<Button
							type="submit"
							className="bg-btnColor text-white px-5 py-3 rounded-lg text-[15px] hover:bg-btnColorHover leading-[24px] font-bold tracking-[-0.01em]"
							isLoading={isPending}
						>
							{trackMetadata?._id ? "Release Track" : "Save Track"}
						</Button>
					</div>

					<ProjectTracksModal projectId={tokenProject?._id} />
				</div>
			</form>
		</FormProvider>
	)
}

export default AddIpMetadata
