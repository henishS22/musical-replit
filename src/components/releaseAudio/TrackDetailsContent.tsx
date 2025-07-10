import { useFormContext } from "react-hook-form"

import { CustomInput } from "@/components/ui/customInput"
import { ReleaseAudioFormData } from "@/types/releaseTypes"

import { UploadTrackModal } from "../modal"
import UploadTrack from "../uploadWork/uploadTrack"

const labelStyles =
	"text-[14px] font-bold text-inputLabel leading-[21px] tracking-[-1.5%]"

export const TrackDetailsContent = () => {
	const { register, setValue } = useFormContext<ReleaseAudioFormData>()

	return (
		<div className="flex gap-8 items-center">
			<div className="flex-1">
				<label className={`flex gap-2 ${labelStyles}`}>Collection Name</label>
				<CustomInput
					type="text"
					placeholder="Music_@.mp3"
					{...register("collectionName")}
					classname="border-2 !border-hoverGray !p-3"
					rounded="rounded-lg"
				/>
			</div>
			<div className="flex-1">
				<label className={`flex gap-2 ${labelStyles}`}>Upload File</label>
				<UploadTrack className="!mb-0 mt-1" />
			</div>
			<UploadTrackModal setValue={setValue} />
		</div>
	)
}
