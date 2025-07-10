import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { useParams } from "next/navigation"

import { checkEmail, sendInvite, sendSmsInvite } from "@/app/api/mutation"
import { fetchCountryCodes } from "@/app/api/query"
import CountryCodeDropdown from "@/components/ui/CountryCodeDropdown"
import { CustomInput } from "@/components/ui/customInput"
import { TypeInviteEnum } from "@/constant/enum"
import { ADD_COLLAB_MODAL } from "@/constant/modalType"
import InviteSchema from "@/validationSchema/inviteSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Spinner } from "@nextui-org/react"
import { useMutation, useQuery } from "@tanstack/react-query"

import { useDynamicStore } from "@/stores"
import { useModalStore } from "@/stores/modal"
import { useDebounce } from "@/hooks/useDebounce"

interface FormValues {
	email?: string
	sms?: string
}

const InviteEmailBody = ({
	setNext,
	type
}: {
	setNext: (state: boolean) => void
	type?: string
}) => {
	const { hideCustomModal, showCustomModal } = useModalStore()
	const { addState, selectedCountry } = useDynamicStore()
	const { id } = useParams()

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors }
	} = useForm<FormValues>({
		resolver: zodResolver(InviteSchema(type as "email" | "sms")),
		mode: "onChange",
		defaultValues: {
			[type as "email" | "sms"]: ""
		}
	})

	const { data: countryCodes = [], isPending: isLoadingCountries } = useQuery({
		queryKey: ["countryCodes"],
		queryFn: fetchCountryCodes,
		enabled: type === TypeInviteEnum.Sms
	})

	// Sort country codes alphabetically by country name
	const sortedCountryCodes = countryCodes.sort((a, b) =>
		a.name.localeCompare(b.name)
	)

	const emailValue = watch("email")
	const debouncedEmail = useDebounce(emailValue, 2000)
	const smsValue = watch("sms")

	const {
		mutate: checkUserEmail,
		data: checkUserEmailData,
		isPending: checkUserEmailLoading
	} = useMutation({
		mutationFn: (email: string) => checkEmail({ email }),
		onSuccess: (data) => {
			if (data) {
				addState("selectedUser", data)
			}
		}
	})

	const { mutate: sendUserInvite, isPending: sendUserInviteLoading } =
		useMutation({
			mutationFn: (payload: { email: string; type: string }) =>
				sendInvite(payload),
			onSuccess: (data) => {
				if (data === "Invite sent successfully!") {
					toast.success(data)
					hideCustomModal()
				}
			}
		})

	const { mutate: sendSms, isPending: sendSmsLoading } = useMutation({
		mutationFn: (
			payload: Record<"phoneNumber" | "countryCode" | "type", string>
		) => sendSmsInvite(payload),
		onSuccess: (data) => {
			if (data?.message === "Invite sent successfully!") {
				toast.success(data?.message)
				hideCustomModal()
			}
		}
	})

	useEffect(() => {
		if (debouncedEmail && !errors.email && type === TypeInviteEnum.Email) {
			checkUserEmail(debouncedEmail)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedEmail])

	const onSubmitForm = (data: FormValues) => {
		if (type === TypeInviteEnum.Email) {
			if (checkUserEmailData === null) {
				sendUserInvite({ email: data?.email || "", type: TypeInviteEnum.Email })
			} else {
				if (id) {
					showCustomModal({
						customModalType: ADD_COLLAB_MODAL,
						tempCustomModalData: { selectedProjectId: id as string }
					})
				} else {
					setNext(true)
				}
			}
		} else {
			sendSms({
				phoneNumber: data?.sms || "",
				countryCode: selectedCountry?.dial_code || "",
				type: TypeInviteEnum.Sms
			})
		}
	}

	return (
		<>
			<form
				onSubmit={handleSubmit((data: FormValues) => {
					onSubmitForm(data)
				})}
				className="flex flex-col items-center"
			>
				<div className="w-full">
					<CustomInput
						{...register(type as TypeInviteEnum.Email | TypeInviteEnum.Sms)}
						type={type === TypeInviteEnum.Email ? "email" : "number"}
						placeholder={
							type === TypeInviteEnum.Email
								? "Enter Email"
								: "Enter Mobile Number"
						}
						classname="h-12 text-[16px] font-semibold bg-white border border-[#D8E0F0] rounded-[16px] px-4 shadow-none"
						errorMessage={errors?.email?.message || errors?.sms?.message}
						wrapperClassName="gap-2 items-center"
						countryCode={
							type === TypeInviteEnum.Sms && (
								<CountryCodeDropdown
									countryCodes={sortedCountryCodes}
									isLoading={isLoadingCountries}
								/>
							)
						}
						endContent={
							checkUserEmailLoading ? (
								<Spinner size="sm" color="default" />
							) : null
						}
						isInvalid={type === "email" ? !!errors?.email : !!errors?.sms}
						rounded="rounded-[16px]"
					/>
					{/* {!errors.email &&
						debouncedEmail &&
						checkUserEmailData === null &&
						!checkUserEmailLoading &&
						!sendUserInviteLoading && (
							<p className="text-noteRed text-xs font-semibold mt-1 leading-[18px]">
								Note: This user is not present in Platform. Please Invite and
								then add as collaborator for your projects.
							</p>
						)} */}
				</div>
				<Button
					isLoading={
						type === TypeInviteEnum.Email
							? sendUserInviteLoading
							: sendSmsLoading
					}
					type="submit"
					disabled={
						type === TypeInviteEnum.Email
							? !debouncedEmail ||
								!!errors.email ||
								checkUserEmailLoading ||
								sendUserInviteLoading
							: !smsValue || !!errors.sms || sendSmsLoading
					}
					className={`flex justify-center self-center mt-[34px] bg-btnColor text-white px-4 py-2 rounded-lg text-[13px] hover:bg-btnColorHover ${
						type === TypeInviteEnum.Email
							? !debouncedEmail ||
								!!errors.email ||
								checkUserEmailLoading ||
								sendUserInviteLoading ||
								!!errors.sms ||
								sendSmsLoading
								? "opacity-50 cursor-not-allowed"
								: ""
							: !smsValue || !!errors.sms || sendSmsLoading
								? "opacity-50 cursor-not-allowed"
								: ""
					}`}
				>
					{type === TypeInviteEnum.Email
						? debouncedEmail &&
							checkUserEmailData !== null &&
							!checkUserEmailLoading &&
							!sendUserInviteLoading
							? "Add Collaborator"
							: "Send Invite"
						: "Send Invite"}
				</Button>
			</form>
		</>
	)
}

export default InviteEmailBody
