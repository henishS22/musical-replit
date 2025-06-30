import { useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"

const PostTextSection = () => {
	const [postText, setPostText] = useState<string>("")
	const { register, setValue, watch } = useFormContext()

	// Watch for external updates to postText
	const formPostText = watch("postText")

	useEffect(() => {
		if (formPostText !== postText) {
			setPostText(formPostText || "")
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [formPostText])

	const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const newValue = e.target.value
		setPostText(newValue)
		setValue("postText", newValue, { shouldDirty: true })
	}

	return (
		<div className="flex flex-col gap-4 w-full">
			<label className="font-bold text-[14px] leading-[21px] tracking-[-0.015em] text-inputLabel">
				Post Text
			</label>
			<textarea
				{...register("postText")}
				value={postText}
				onChange={handleTextChange}
				className="resize-none !h-[106px] !w-full bg-transparent border-[2px] border-hoverGray rounded-lg p-3 text-[14px] leading-[21px] tracking-[-0.015em] font-medium"
			/>
		</div>
	)
}

export default PostTextSection
