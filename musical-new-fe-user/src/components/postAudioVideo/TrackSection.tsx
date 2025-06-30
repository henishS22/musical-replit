import { useEffect } from "react"
import { useFormContext } from "react-hook-form"

import { MUSIC } from "@/assets"
import { Track } from "@/types"

import { AudioFile, useDynamicStore } from "@/stores/dynamicStates"

import FileDisplay from "../createProject/FileDisplay"
import { CustomInput } from "../ui/customInput"

const TrackNameSection = () => {
	const { trackId } = useDynamicStore()
	const {
		register,
		setValue,
		formState: { errors }
	} = useFormContext()

	useEffect(() => {
		if ((trackId as Track)?.name) {
			setValue("trackName", (trackId as Track)?.name)
			setValue("trackfile", (trackId as Track)?.url)
		}
	}, [trackId, setValue])

	return (
		<>
			<CustomInput
				{...register("trackName")}
				label="Track Name"
				labelClassName="font-bold text-sm text-inputLabel"
				placeholder="Track Name"
				type="text"
				id="trackName"
				value={(trackId as Track)?.name}
				classname="!bg-hoverGray !border-none !py-3 !px-3 text-textGray text-[14px] font-medium leading-7 tracking-tighter"
				readOnly
			/>
			<FileDisplay
				// fileName={(trackId as Track)?.name || ""}
				duration={(trackId as AudioFile)?.duration || 0}
				iconSrc={MUSIC}
				error={errors?.trackfile?.message as string}
				smallWaveformImage={(trackId as Track)?.imageWaveSmall || ""}
			/>
		</>
	)
}

export default TrackNameSection
