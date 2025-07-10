"use client"

import { FormProvider, useForm } from "react-hook-form"

import { TitleBadgeCard } from "@/components/ui"
import Savebtn from "@/components/ui/savebtn/savebtn"
import { ReleaseAudioFormData } from "@/types/releaseTypes"

import TextEditor from "../ui/textEditor/TextEditor"
import { SocialMediaContent } from "./SocialMediaContent"
import { TrackDetailsContent } from "./TrackDetailsContent"

const ReleaseAudioForm = () => {
	// const router = useRouter()
	const methods = useForm<ReleaseAudioFormData>({
		defaultValues: {
			collectionName: "",
			file: null,
			spotifyUrl: "",
			appleUrl: "",
			youtubeUrl: "",
			instagramUrl: "",
			tiktokUrl: "",
			xUrl: "",
			message: ""
		}
	})

	const onSubmit = (data: ReleaseAudioFormData) => {
		console.info("Form submitted:", data)
	}

	return (
		<FormProvider {...methods}>
			<form onSubmit={methods.handleSubmit(onSubmit)} className="">
				<div className="flex flex-col gap-6">
					<h1 className="text-[20px] font-bold leading-6">Release Audio</h1>

					<TitleBadgeCard
						titleClassName="!text-[14px] !font-bold text-inputLabel"
						wrapperClass="!mb-0"
						markColor="#CABDFF"
						title="Track Details"
					>
						<TrackDetailsContent />
					</TitleBadgeCard>

					<TitleBadgeCard
						titleClassName="!text-[14px] !font-bold text-inputLabel"
						wrapperClass="!mb-0"
						markColor="#CABDFF"
						title="Social Media"
					>
						<SocialMediaContent />
					</TitleBadgeCard>

					<TitleBadgeCard
						titleClassName="!text-[14px] !font-bold text-inputLabel"
						wrapperClass="!mb-0"
						markColor="#CABDFF"
						title="Message Us"
					>
						<TextEditor
							value={methods.watch("message")}
							onChange={(value) => methods.setValue("message", value)}
						/>
					</TitleBadgeCard>

					<div className="flex justify-end space-x-3 mt-4">
						<Savebtn
							className="w-fit self-end bg-btnColor text-white px-5 py-3 rounded-lg text-[15px] hover:bg-btnColorHover leading-[24px] font-bold tracking-[-0.01em]"
							label="Submit"
							onClick={methods.handleSubmit(onSubmit)}
						/>
					</div>
				</div>
			</form>
		</FormProvider>
	)
}

export default ReleaseAudioForm
