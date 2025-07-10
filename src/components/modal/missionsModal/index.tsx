import { useEffect, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { toast } from "react-toastify"

import { missionScrappers, otpSend } from "@/app/api/mutation"
import { fetchCountryCodes, fetchCreatorQuestDetails } from "@/app/api/query"
import CountryCodeDropdown from "@/components/ui/CountryCodeDropdown"
import { CustomInput } from "@/components/ui/customInput"
import { InputSection } from "@/components/ui/inputSection/InputSection"
import VerifyingText from "@/components/ui/loader/TextLoader"
import OtpInput from "@/components/ui/otpInput/OtpInput"
import { MISSIONS_MODAL } from "@/constant/modalType"
import { MissionsIconMap } from "@/helpers"
import { MissionsEndPointMap } from "@/helpers/missionHelpers"
import { missionValidationSchemas } from "@/validationSchema/missionsSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Skeleton } from "@nextui-org/react"
import { useMutation, useQuery } from "@tanstack/react-query"

import { missionPlaceholders } from "@/config/missions"
import { useDynamicStore, useModalStore, useUserStore } from "@/stores"

import CustomModal from "../CustomModal"

type IdentifierType = keyof typeof missionValidationSchemas

const MissionsModal = () => {
	const { customModalType, tempCustomModalData, hideCustomModal } =
		useModalStore()
	const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
	const { userData } = useUserStore()
	const { selectedCountry } = useDynamicStore()
	const [phoneInfo, setPhoneInfo] = useState<{
		mobile: string
		countryCode: string
	} | null>(null)

	const isPostUrlMission = tempCustomModalData?.post_url

	const { data: countryCodes = [], isPending: isLoadingCountries } = useQuery({
		queryKey: ["countryCodes"],
		queryFn: fetchCountryCodes,
		enabled:
			tempCustomModalData?.identifier === "sign_up_for_text" && !isVerifyingOtp
	})

	// Sort country codes alphabetically by country name
	const sortedCountryCodes = countryCodes.sort((a, b) =>
		a.name.localeCompare(b.name)
	)

	const identifier = tempCustomModalData?.identifier as IdentifierType

	const schema = isPostUrlMission
		? missionValidationSchemas["post_url"]
		: missionValidationSchemas[identifier] || missionValidationSchemas.connect_x

	const placeholder = missionPlaceholders[identifier] || "Enter value"

	const methods = useForm({
		resolver: zodResolver(schema),
		defaultValues: isPostUrlMission
			? { url: "", post: "" }
			: {
					value:
						tempCustomModalData?.identifier === "sign_up_for_email"
							? userData?.email
							: ""
				}
	})

	const {
		register,
		handleSubmit,
		setValue,
		trigger,
		reset,
		formState: { errors }
	} = methods

	const { data: QuestDetails, isLoading: loadingDetails } = useQuery({
		queryKey: ["QuestDetails", tempCustomModalData?.creatorQuestId],
		queryFn: () =>
			fetchCreatorQuestDetails(tempCustomModalData?.creatorQuestId),
		enabled: !!tempCustomModalData?.creatorQuestId
	})

	const isAvailable: boolean = QuestDetails?.isAvailable ?? false

	const { mutate, isPending: isChecking } = useMutation({
		mutationKey: ["missionScrappers"],
		mutationFn: ({
			social,
			payload
		}: {
			social: string
			payload: {
				email?: string
				url?: string
				mobile?: string
				countryCode?: string
				code?: string
				post?: string
				questId: string
			}
		}) => missionScrappers(social, payload),
		onSuccess: (data) => {
			if (data && data.status !== "error") {
				toast.success(data?.message)
				hideCustomModal()
				reset()
				if (identifier === "sign_up_for_text") {
					setIsVerifyingOtp((prev) => !prev)
				}
			}
		}
	})

	const { mutate: otp, isPending: isSendingOtp } = useMutation({
		mutationKey: ["otpSend"],
		mutationFn: (payload: { countryCode: string; mobile: string }) =>
			otpSend(payload),
		onSuccess: (data) => {
			if (data && data.status !== "error") {
				toast.success("OTP sent successfully")
				setIsVerifyingOtp((prev) => !prev)
			}
		}
	})

	const onSubmit = (
		data: { value?: string } | { url: string; post: string }
	) => {
		const social = MissionsEndPointMap[identifier]
		const questId = tempCustomModalData?.questId as string

		if ("url" in data && "post" in data) {
			mutate({
				social,
				payload: { url: data.url, post: data.post as string, questId }
			})
		}
	}

	const handleInputSectionComplete = async (value: string) => {
		setValue("value", value)

		// Manually trigger validation
		const isValid = await trigger("value")

		if (!isValid) return

		const social = MissionsEndPointMap[identifier]

		if (social === "signup-text") {
			setPhoneInfo({ mobile: value, countryCode: selectedCountry?.dial_code })
			otp({ countryCode: selectedCountry?.dial_code, mobile: value })
			return
		}

		mutate({
			social,
			payload: {
				...(social === "signup-email" ? { email: value } : { url: value }),
				...(tempCustomModalData?.questId
					? { questId: tempCustomModalData?.questId }
					: tempCustomModalData?.creatorQuestId && {
							creatorQuestId: tempCustomModalData?.creatorQuestId
						})
			}
		})
	}

	const handleOtpVerify = async (value: string) => {
		mutate({
			social: "signup-text",
			payload: {
				mobile: phoneInfo?.mobile,
				countryCode: phoneInfo?.countryCode,
				code: value,
				questId: tempCustomModalData?.questId
			}
		})
	}

	const handleClose = () => {
		setIsVerifyingOtp(false)
		reset()
		hideCustomModal()
	}

	useEffect(() => {
		if (QuestDetails && !isAvailable) {
			toast.error("This quest is no longer available.")
			hideCustomModal()
		}
	}, [QuestDetails, isAvailable, hideCustomModal])

	return (
		<CustomModal
			showModal={customModalType === MISSIONS_MODAL}
			onClose={handleClose}
			isBreadcrumb
			size="5xl"
			modalBodyClass="max-w-[540px]"
			title="Missions"
			dropdownConfig={{
				isStatic: true,
				isStaticIcon: false,
				activeLabel: tempCustomModalData?.title,
				options: []
			}}
		>
			{loadingDetails ? (
				<div className="flex flex-col items-center gap-4 p-6">
					<Skeleton className="w-14 h-14 rounded-xl" />
					<Skeleton className="w-40 h-6 rounded-md" />
					<Skeleton className="w-64 h-5 rounded-md" />
					<Skeleton className="w-56 h-5 rounded-md" />
					<Skeleton className="w-full h-12 rounded-md mt-4" />
				</div>
			) : (
				<div className="p-6">
					<div className="flex flex-col items-center gap-7 px-4 py-4">
						<span className="max-w-[56px] max-h-[56px] rounded-xl">
							{MissionsIconMap[identifier]}
						</span>
						<div className="flex flex-col gap-3 items-center">
							<span className="font-bold text-lg text-textPrimary">
								{tempCustomModalData?.title}
							</span>
							<span className="font-semibold text-sm text-textGray">
								{tempCustomModalData?.description}
							</span>
						</div>
						<FormProvider {...methods}>
							<div className="w-full">
								<form
									className={`w-full ${isPostUrlMission ? "flex flex-col gap-4" : "flex gap-2"}`}
									{...(isPostUrlMission && {
										onSubmit: handleSubmit(onSubmit)
									})}
								>
									{isPostUrlMission ? (
										<>
											<CustomInput
												label="Profile URL"
												type="url"
												placeholder="Enter profile URL"
												isInvalid={!!errors.url}
												errorMessage={errors.url?.message as string}
												{...register("url")}
												disabled={isChecking}
												classname="w-full px-4 py-3 pr-[64px] border !border-[#D8E0F0] !rounded-2xl focus:outline-none h-49 flex-1 !mt-0"
											/>
											<CustomInput
												label="Post URL"
												type="url"
												placeholder="Enter post URL"
												isInvalid={!!errors.post}
												errorMessage={errors.post?.message as string}
												{...register("post")}
												disabled={isChecking}
												classname="w-full px-4 py-3 pr-[64px] border !border-[#D8E0F0] !rounded-2xl focus:outline-none h-49 flex-1 !mt-0"
											/>
											<Button
												type="submit"
												color="primary"
												isLoading={isChecking}
												className="w-full h-[48px] px-5 py-3 gap-2 rounded-lg bg-btnColor hover:bg-btnColorHover text-white font-bold"
											>
												Submit
											</Button>
										</>
									) : (
										<>
											{identifier === "sign_up_for_text" && !isVerifyingOtp && (
												<CountryCodeDropdown
													countryCodes={sortedCountryCodes}
													isLoading={isLoadingCountries}
												/>
											)}
											<div className="flex-1">
												{!isVerifyingOtp ? (
													<InputSection
														isDisabled={isSendingOtp || isChecking}
														placeholder={placeholder}
														onComplete={(file, type, value) =>
															handleInputSectionComplete(value)
														}
														isInvalid={!!errors.value}
														{...(identifier === "sign_up_for_email" && {
															defaultValue: userData?.email,
															disabled: true
														})}
													/>
												) : (
													<>
														<OtpInput
															onComplete={handleOtpVerify}
															disabled={isChecking}
														/>
														{isChecking && (
															<div className="flex justify-center mt-4">
																<div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
																<VerifyingText />
															</div>
														)}
													</>
												)}
											</div>
										</>
									)}
								</form>
								{!isPostUrlMission && errors.value?.message && (
									<span className="text-red-500 text-xs">
										{errors?.value?.message as string}
									</span>
								)}
							</div>
						</FormProvider>
					</div>
				</div>
			)}
		</CustomModal>
	)
}

export default MissionsModal
