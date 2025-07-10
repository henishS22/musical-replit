import { useForm } from "react-hook-form"

import { useDynamicStore } from "@/stores"

import { InputField } from "../common/FormFields"
import FormLayout from "../common/FormLayout"

interface BudgetForm {
	budget: string
	estimatedClicks: string
	cpc: string
}

const BudgetSetup = () => {
	const { addState, socialCampaignData } = useDynamicStore()
	const { handleSubmit, watch, setValue } = useForm<BudgetForm>({
		defaultValues: {
			budget: "",
			estimatedClicks: "",
			cpc: ""
		}
	})

	const onSubmit = (data: BudgetForm) => {
		addState("socialCampaignData", {
			...socialCampaignData,
			...data
		})
		// Handle final submission
	}

	return (
		<FormLayout
			title="Set Up Your Meta Campaign"
			onNext={handleSubmit(onSubmit)}
			disabled={!watch("budget")}
			buttonText="Next"
		>
			<div className="flex flex-col gap-[26px]">
				<InputField
					label="Budget"
					value={watch("budget")}
					onChange={(e) => setValue("budget", e.target.value)}
					placeholder="$500"
				/>

				<InputField
					label="Estimated Clicks"
					value={watch("estimatedClicks")}
					onChange={(e) => setValue("estimatedClicks", e.target.value)}
					placeholder="22,000"
				/>

				<InputField
					label="CPC (Cost per click)"
					value={watch("cpc")}
					onChange={(e) => setValue("cpc", e.target.value)}
					placeholder="$0.0227"
				/>
			</div>
		</FormLayout>
	)
}

export default BudgetSetup
