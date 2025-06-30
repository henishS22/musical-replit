import Image from "next/image"

import { NON_GRADIENT_STARS_ICON } from "@/assets"
import { Button } from "@nextui-org/react"

const SuggestionButton = ({
	text,
	onClick,
	isLoading,
	isDisabled,
	primaryBtn = false
}: {
	text: string
	onClick: () => void
	isLoading: boolean
	isDisabled: boolean
	primaryBtn?: boolean
}) => {
	return (
		<Button
			isLoading={isLoading}
			isDisabled={isDisabled}
			onPress={onClick}
			className={`px-2 py-1 rounded-lg !gap-[6px] text-sm transition-colors ${primaryBtn ? "bg-videoBtnGreen text-[#1DB954] text-[10px] font-bold leading-4" : "bg-btnColor text-white text-[10px] font-bold leading-4"}`}
		>
			{primaryBtn && (
				<span>
					<Image
						src={NON_GRADIENT_STARS_ICON}
						alt="check"
						width={20}
						height={20}
					/>
				</span>
			)}
			{text}
		</Button>
	)
}

export default SuggestionButton
