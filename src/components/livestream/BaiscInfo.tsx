import { useFormContext } from "react-hook-form"

import { CustomInput, TitleBadgeCard } from "../ui"
import TextEditor from "../ui/textEditor/TextEditor"
import CustomTooltip from "../ui/tooltip"

const BasicInfo = () => {
	const {
		register,
		formState: { errors },
		setValue,
		watch
	} = useFormContext()
	return (
		<TitleBadgeCard
			markColor="#B5E4CA"
			title="Title & Description"
			titleClassName="!mb-0"
		>
			<div className="flex flex-col gap-6 mt-8">
				<CustomInput
					{...register("title")}
					label="Title"
					type="text"
					showTooltip
					tooltipText="Maximum 100 characters. No HTML or emoji allowed"
					placeholder="Enter title"
					classname="border-2 border-blueBorder rounded-xl"
					errorMessage={errors.title?.message as string}
					isInvalid={!!errors.title}
				/>
				<div>
					<label className="text-base font-semibold text-inputLabel mb-[14px] block flex items-center gap-1">
						Description{" "}
						<span>
							<CustomTooltip tooltipContent="Write a description for your livestream" />
						</span>
					</label>
					<TextEditor
						value={watch("description")}
						onChange={(value) =>
							setValue("description", value, { shouldDirty: true })
						}
					/>
				</div>
			</div>
		</TitleBadgeCard>
	)
}

export default BasicInfo
