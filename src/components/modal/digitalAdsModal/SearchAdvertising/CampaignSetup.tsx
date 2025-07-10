import { useForm } from "react-hook-form"

import { updateModalStep } from "@/helpers/modalStepHelpers"
import { SearchCampaignForm, SocialCampaignForm } from "@/types/digitalAdsTypes"

import { useDynamicStore } from "@/stores"

import { DropdownField, InputField } from "../common/FormFields"
import FormLayout from "../common/FormLayout"

const CampaignSetup = ({ type }: { type: string }) => {
	const { addState, removeState } = useDynamicStore()
	const { handleSubmit, watch, setValue } = useForm<
		SearchCampaignForm | SocialCampaignForm
	>({
		defaultValues: {
			name: "",
			goal: "",
			keywords: [],
			audience: ""
		}
	})

	const goalOptions = [
		{ key: "drive_traffic", label: "Drive Traffic" },
		{ key: "increase_sales", label: "Increase Sales" },
		{ key: "raise_awareness", label: "Raise Awareness" }
	]

	const audienceInterests = [
		{ key: "classical", label: "Classical" },
		{ key: "live_concerts", label: "Live Concerts" },
		{ key: "music_festivals", label: "Music Festivals" },
		{ key: "indie_music", label: "Indie Music" },
		{ key: "pop_music", label: "Pop Music" },
		{ key: "jazz", label: "Jazz" },
		{ key: "electronic_dance_music", label: "Electronic Dance Music" }
	]

	const onSubmit = (data: SearchCampaignForm | SocialCampaignForm) => {
		addState(
			type === "search" ? "searchCampaignData" : "socialCampaignData",
			data
		)
		removeState("chips")
		updateModalStep(2)
	}

	return (
		<FormLayout
			title="Set Up Your Google Search Campaign"
			onNext={handleSubmit(onSubmit)}
			disabled={
				!watch("name") ||
				(type === "search" ? !watch("goal") : !watch("audience"))
			}
		>
			<InputField
				label="Campaign Name"
				value={watch("name")}
				onChange={(e) => setValue("name", e.target.value)}
			/>

			<DropdownField
				label={type === "search" ? "Campaign Goal" : "Audience Interest"}
				value={type === "search" ? watch("goal") : watch("audience")}
				options={type === "search" ? goalOptions : audienceInterests}
				onChange={(key) =>
					type === "search" ? setValue("goal", key) : setValue("audience", key)
				}
			/>
		</FormLayout>
	)
}

export default CampaignSetup
