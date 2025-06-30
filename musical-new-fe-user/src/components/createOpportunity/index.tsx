"use client"

import { useEffect, useMemo } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"

import { CollaborationsOpportunites } from "@/app/api/mutation"
import ProjectBrief from "@/components/createOpportunity/ProjectBrief/ProjectBrief"
import ProjectNeeds from "@/components/createOpportunity/ProjectNeeds/ProjectNeeds"
import SelectProject from "@/components/createOpportunity/SelectProject/SelectProject"
import Stepper from "@/components/createOpportunity/Stepper"
import Savebtn from "@/components/ui/savebtn/savebtn"
import { OPPORTUNITY_CREATED_SUCCESSFULLY } from "@/constant/toastMessages"
import formatOpportunityPayload from "@/helpers/formatPayloadHelpers"
import { createOpportunitySchema } from "@/validationSchema/createOpportunitySchema"
import { zodResolver } from "@hookform/resolvers/zod"
import { Spinner } from "@nextui-org/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { STEP_VALIDATIONS } from "@/config"
import { useDynamicStore } from "@/stores"
import { useFormNavigationAlert } from "@/hooks/useFormNavigationAlert"

import Summary from "./summary/Summary"

const CreateOpportunity = () => {
	const { addState, CreateOpportunity, updateState, removeState, engageFlow } =
		useDynamicStore()
	const router = useRouter()
	const queryClient = useQueryClient()
	const { mutate, isPending } = useMutation({
		mutationFn: CollaborationsOpportunites,
		onSuccess: (data) => {
			if (data) {
				updateState("formNavigation", { isDirty: false })
				queryClient.invalidateQueries({ queryKey: ["usedProject"] })
				queryClient.invalidateQueries({ queryKey: ["opportunityList"] })
				router.push(`/community`)
				toast.success(OPPORTUNITY_CREATED_SUCCESSFULLY)
				removeState("trackId")
				removeState("engageFlow")
				removeState("CreateOpportunity")
			}
		}
	})

	const methods = useForm({
		resolver: zodResolver(createOpportunitySchema),
		defaultValues: {
			selectedProject: null,
			title: "",
			languages: [],
			skills: [],
			styles: [],
			designs: [],
			duration: "",
			brief: "",
			track: []
		}
	})

	const {
		trigger,
		formState: { isDirty }
	} = methods

	// Form Navigation Alert
	useFormNavigationAlert({ formState: { isDirty } })

	const validateStep = async (step: number) => {
		const fieldsToValidate =
			STEP_VALIDATIONS[step as keyof typeof STEP_VALIDATIONS]
		return fieldsToValidate ? await trigger(fieldsToValidate) : true
	}

	const handleNext = async () => {
		const isValid = await validateStep(CreateOpportunity?.currentStep)

		if (isValid) {
			const updatedSteps = [
				...(CreateOpportunity.stepsCompleted || [false, false, false, false])
			]
			updatedSteps[CreateOpportunity.currentStep] = true

			if (CreateOpportunity?.currentStep < 4) {
				updateState("CreateOpportunity", {
					...CreateOpportunity,
					currentStep: CreateOpportunity.currentStep + 1,
					stepsCompleted: updatedSteps
				})
			} else {
				mutate(formatOpportunityPayload(CreateOpportunity, engageFlow))
			}
		}
	}

	const renderStep = useMemo(() => {
		switch (CreateOpportunity?.currentStep) {
			case 0:
				return (
					<SelectProject
						title="Select a Project"
						markColor="#B5E4CA"
						label="Choose the project you would like to collaborate on"
						placeholder="Search for more..."
					/>
				)
			case 1:
				return (
					<SelectProject
						title="Basic Info"
						markColor="#FFBC99"
						label="Title"
						placeholder="Enter Title Name"
					/>
				)
			case 2:
				return <ProjectNeeds title="Project Needs" markColor="#B1E5FC" />
			case 3:
				return <ProjectBrief title="Project Brief" markColor="#CABDFF" />
			case 4:
				return <Summary />
			default:
				return <Spinner size="lg" color="default" className="min-h-[50vh]" />
		}
	}, [CreateOpportunity?.currentStep])

	useEffect(() => {
		if (!CreateOpportunity) {
			addState("CreateOpportunity", {
				currentStep: 0,
				stepsCompleted: [false, false, false, false],
				selectedTracks: [],
				uploadedTrack: null,
				trackId: null,
				selectedProject: null,
				title: "",
				languages: [],
				skills: [],
				styles: [],
				duration: "",
				brief: "",
				track: []
			})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [CreateOpportunity?.currentStep])

	return (
		<FormProvider {...methods}>
			<form onSubmit={(e) => e.preventDefault()}>
				<div className="flex flex-col gap-6">
					<h1 className="text-4xl font-semibold tracking-tighter leading-tight text-zinc-800">
						{!engageFlow ? "Create an Opportunity" : "Create a Fan Contest"}
					</h1>
					<Stepper
						currentStep={CreateOpportunity?.currentStep}
						stepsCompleted={
							CreateOpportunity?.stepsCompleted || [false, false, false, false]
						}
						steps={[
							"Select a Project",
							"Basic Info",
							"Project Needs",
							"Project Brief",
							"Summary"
						]}
					/>
					{renderStep}
					<div className="flex gap-4 justify-end">
						{CreateOpportunity?.currentStep > 0 && (
							<Savebtn
								className="w-fit self-end bg-videoBtnGreen text-[#0D5326] px-4 py-2 rounded-lg text-[13px] leading-[24px] font-bold tracking-[-0.01em]"
								label="Back"
								onClick={() => {
									updateState("CreateOpportunity", {
										currentStep: CreateOpportunity.currentStep - 1
									})
								}}
							/>
						)}
						<Savebtn
							isLoading={isPending}
							className="w-fit self-end bg-btnColor text-white px-4 py-2 rounded-lg text-[13px] hover:bg-btnColorHover leading-[24px] font-bold tracking-[-0.01em]"
							label={CreateOpportunity?.currentStep === 4 ? "Submit" : "Next"}
							onClick={handleNext}
						/>
					</div>
				</div>
			</form>
		</FormProvider>
	)
}

export default CreateOpportunity
