import { useForm } from "react-hook-form"

import UploadTrack from "@/components/uploadWork/uploadTrack"
import { updateModalStep } from "@/helpers/modalStepHelpers"

import { useDynamicStore } from "@/stores"

import { DropdownField, InputField } from "../common/FormFields"
import FormLayout from "../common/FormLayout"

interface MetaCampaignForm {
	headline: string
	description: string
	media: string
	location: string
}

const MetaCampaignSetup = () => {
	const { addState } = useDynamicStore()
	const { handleSubmit, watch, setValue } = useForm<MetaCampaignForm>({
		defaultValues: {
			headline: "",
			description: "",
			media: "",
			location: ""
		}
	})

	const locationOptions = [
		{ key: "us", label: "United States" },
		{ key: "uk", label: "United Kingdom" },
		{ key: "eu", label: "Europe" },
		{ key: "global", label: "Global" }
	]

	const onSubmit = (data: MetaCampaignForm) => {
		addState("socialCampaignData", data)
		updateModalStep(3)
	}

	return (
		<FormLayout
			title="Set Up Your Meta Campaign"
			onNext={handleSubmit(onSubmit)}
			disabled={
				!watch("headline") || !watch("description") || !watch("location")
			}
		>
			<div className="flex flex-col gap-[26px]">
				<InputField
					label="Headline"
					value={watch("headline")}
					onChange={(e) => setValue("headline", e.target.value)}
					placeholder="Enter Heading"
				/>

				<div className="space-y-2">
					<label className="text-inputLabel font-semibold text-[14px] leading-[24px] tracking-[-0.01em]">
						Description
					</label>
					<textarea
						value={watch("description")}
						onChange={(e) => setValue("description", e.target.value)}
						placeholder="Enter Description"
						className="w-full min-h-[120px] !bg-white !border-2 !border-customGray !rounded-xl !p-3 !text-sm resize-none"
					/>
				</div>

				<div>
					<label className="text-inputLabel font-semibold text-[14px] leading-[24px] tracking-[-0.01em] mb-2 block">
						Upload Image/Video
					</label>
					<UploadTrack className="!mb-0" />
				</div>

				<div>
					<label className="text-inputLabel font-semibold text-[14px] leading-[24px] tracking-[-0.01em] mb-2 block">
						Location
					</label>
					<DropdownField
						label=""
						value={watch("location")}
						options={locationOptions}
						onChange={(key) => setValue("location", key)}
					/>
				</div>
			</div>
		</FormLayout>
	)
}

export default MetaCampaignSetup
