import { useFormContext } from "react-hook-form"

import { Radio, RadioGroup } from "@nextui-org/react"

import { TitleBadgeCard } from "../ui"

const AccessControl = () => {
	const { setValue, watch } = useFormContext()

	return (
		<TitleBadgeCard
			markColor="#FFBC99"
			title="Access Control"
			titleClassName="!mb-0"
		>
			<div className="flex flex-col mt-6 gap-4 w-full">
				<div className="font-bold text-base leading-[150%] tracking-tighter text-inputLabel">
					Who can Join ?
				</div>
				<RadioGroup
					value={watch("accessType")}
					onValueChange={(value) =>
						setValue("accessType", value as "public" | "private", {
							shouldDirty: true
						})
					}
					classNames={{
						wrapper: "gap-4 flex flex-row w-full"
					}}
				>
					<Radio value="public" className="flex-1 max-w-none">
						Anyone (Public livestream)
					</Radio>
					<Radio value="private" className="flex-1 max-w-none">
						Token Holders Only (Private)
					</Radio>
				</RadioGroup>
			</div>
		</TitleBadgeCard>
	)
}

export default AccessControl
