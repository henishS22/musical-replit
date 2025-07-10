"use client"

import { FormProvider, useForm } from "react-hook-form"
import { toast } from "react-toastify"

import { createDistro } from "@/app/api/mutation"
import { TitleBadgeCard } from "@/components/ui"
import { CustomInput } from "@/components/ui/customInput"
import Savebtn from "@/components/ui/savebtn/savebtn"
import CustomTooltip from "@/components/ui/tooltip"
import getApprovalSchema, {
	GetApprovalFormData
} from "@/validationSchema/GetApprovalSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"

import { useDynamicStore, useUserStore } from "@/stores"
import { useFormNavigationAlert } from "@/hooks/useFormNavigationAlert"

const labelStyles =
	"text-[14px] font-bold text-inputLabel leading-[21px] tracking-[-1.5%]"

const GetApproval = () => {
	const { userData } = useUserStore()
	const { updateState } = useDynamicStore()
	const methods = useForm<GetApprovalFormData>({
		defaultValues: {
			spotifyUrl: "",
			appleUrl: "",
			username: userData?.username,
			youtubeUrl: "",
			instagramUrl: "",
			tiktokUrl: "",
			xUrl: "",
			message: ""
		},
		resolver: zodResolver(getApprovalSchema)
	})

	const {
		formState: { errors, isDirty },
		handleSubmit
	} = methods

	// Form Navigation Alert
	useFormNavigationAlert({ formState: { isDirty } })

	const { mutate, isPending } = useMutation({
		mutationFn: (data: Record<string, string>) => createDistro(data),
		onSuccess: (data) => {
			if (data) {
				updateState("formNavigation", { isDirty: false })
				toast.success("Distro created successfully")
				methods.reset()
			}
		},
		onError: (error: Error) => {
			toast.error(error.message)
		}
	})

	const handleCreateDistro = (data: GetApprovalFormData) => {
		const payload = {
			userName: data.username,
			spotify: data.spotifyUrl,
			youtube: data.youtubeUrl,
			tiktok: data.tiktokUrl,
			apple: data.appleUrl,
			instagram: data.instagramUrl,
			message: data.message,
			x: data.xUrl
		}
		mutate(payload)
	}

	return (
		<FormProvider {...methods}>
			<form>
				<div className="flex flex-col gap-6">
					<h1 className="text-[20px] font-bold leading-6">
						Get Approved for Distro
					</h1>
					<TitleBadgeCard
						titleClassName="text-[14px]"
						wrapperClass="!mb-0"
						markColor="#CABDFF"
						title="User Details"
					>
						<div className=" flex-1 flex flex-col gap-3">
							<label className={`flex gap-2 ${labelStyles}`}>
								Username
								<CustomTooltip tooltipContent="Enter your username" />
							</label>
							<CustomInput
								type="text"
								placeholder="Enter your username"
								{...methods.register("username")}
								classname="!border-0 !bg-[#F4F4F4] text-primary !p-3 rounded-xl"
								rounded="rounded-lg"
								isInvalid={!!errors.username}
								errorMessage={errors.username?.message}
							/>
						</div>
					</TitleBadgeCard>

					<TitleBadgeCard
						wrapperClass="!mb-0"
						markColor="#CABDFF"
						title="Social Media"
					>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className={`flex gap-2 ${labelStyles}`}>
									Spotify
									<CustomTooltip tooltipContent="Enter your Spotify profile URL" />
								</label>
								<CustomInput
									type="text"
									placeholder="Enter Spotify profile URL"
									{...methods.register("spotifyUrl")}
									classname="border-2 !border-hoverGray !p-3"
									rounded="rounded-lg"
									isInvalid={!!errors.spotifyUrl}
									errorMessage={errors.spotifyUrl?.message}
								/>
							</div>

							<div>
								<label className={`flex gap-2 ${labelStyles} text-gray-70`}>
									Apple Music
									<CustomTooltip tooltipContent="Enter your Apple Music profile URL" />
								</label>
								<CustomInput
									type="text"
									placeholder="Enter Apple Music profile URL"
									{...methods.register("appleUrl")}
									classname="border-2 !border-hoverGray !p-3"
									rounded="rounded-lg"
									isInvalid={!!errors.appleUrl}
									errorMessage={errors.appleUrl?.message}
								/>
							</div>

							<div>
								<label className={`flex gap-2 ${labelStyles}`}>
									Youtube
									<CustomTooltip tooltipContent="Enter your Youtube profile URL" />
								</label>
								<CustomInput
									type="text"
									placeholder="Enter Youtube profile URL"
									{...methods.register("youtubeUrl")}
									classname="border-2 !border-hoverGray !p-3"
									rounded="rounded-lg"
									isInvalid={!!errors.youtubeUrl}
									errorMessage={errors.youtubeUrl?.message}
								/>
							</div>

							<div>
								<label className={`flex gap-2 ${labelStyles}`}>
									Instagram
									<CustomTooltip tooltipContent="Enter your Instagram profile URL" />
								</label>
								<CustomInput
									type="text"
									placeholder="Enter Instagram profile URL"
									{...methods.register("instagramUrl")}
									classname="border-2 !border-hoverGray !p-3"
									rounded="rounded-lg"
									isInvalid={!!errors.instagramUrl}
									errorMessage={errors.instagramUrl?.message}
								/>
							</div>

							<div>
								<label className={`flex gap-2 ${labelStyles}`}>
									Tiktok
									<CustomTooltip tooltipContent="Enter your Tiktok profile URL" />
								</label>
								<CustomInput
									type="text"
									placeholder="Enter Tiktok profile URL"
									{...methods.register("tiktokUrl")}
									classname="border-2 !border-hoverGray !p-3"
									rounded="rounded-lg"
									isInvalid={!!errors.tiktokUrl}
									errorMessage={errors.tiktokUrl?.message}
								/>
							</div>

							<div>
								<label className={`flex items-center gap-2 ${labelStyles}`}>
									X
									<CustomTooltip tooltipContent="Enter your X profile URL" />
								</label>
								<CustomInput
									type="text"
									placeholder="Enter X profile URL"
									{...methods.register("xUrl")}
									classname="border-2 !border-hoverGray !p-3"
									rounded="rounded-lg"
									isInvalid={!!errors.xUrl}
									errorMessage={errors.xUrl?.message}
								/>
							</div>
						</div>
					</TitleBadgeCard>

					<TitleBadgeCard
						wrapperClass="!mb-0"
						markColor="#CABDFF"
						title="Message"
					>
						<div className=" flex-1 flex flex-col gap-3">
							<label className={`flex gap-2 ${labelStyles}`}>
								Message
								<CustomTooltip tooltipContent="Enter your message" />
							</label>
							<CustomInput
								type="text"
								placeholder="Enter your message"
								{...methods.register("message")}
								classname="!border-0 !bg-[#F4F4F4] text-primary !p-3 rounded-xl"
								rounded="rounded-lg"
								isInvalid={!!errors.message}
								errorMessage={errors.message?.message}
							/>
						</div>
					</TitleBadgeCard>

					<div className="flex justify-end space-x-3 mt-4">
						<Savebtn
							isLoading={isPending}
							className="w-fit self-end bg-btnColor text-white px-5 py-3 rounded-lg text-[15px] hover:bg-btnColorHover leading-[24px] font-bold tracking-[-0.01em]"
							label="Submit"
							onClick={handleSubmit(handleCreateDistro)}
						/>
					</div>
				</div>
			</form>
		</FormProvider>
	)
}

export default GetApproval
