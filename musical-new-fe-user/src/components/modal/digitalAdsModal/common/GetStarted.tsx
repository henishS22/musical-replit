import { SPEAKER_ICON } from "@/assets"
import { ArtworkModal } from "@/components/dashboard/create-module/artwork-modal"

interface GetStartedProps {
	description: string
	onClick: () => void
	title: string
	secondaryButtonText?: string
	secondaryButtonOnClick?: () => void
	secondaryButton: boolean
}

const GetStarted = ({
	description,
	onClick,
	title,
	secondaryButtonText,
	secondaryButtonOnClick,
	secondaryButton
}: GetStartedProps) => {
	return (
		<ArtworkModal
			icon={{
				src: SPEAKER_ICON,
				alt: "icon",
				bgColor: "bg-green-100"
			}}
			title={title}
			headClasses={{
				title:
					"!font-bold !text-md !text-[#0A1629] !leading-[24px] !tracking-[0px]",
				description:
					"!font-medium !text-[15px] leading-[24px] tracking-[-0.01em] !text-textGray"
			}}
			description={description}
			existingProject={{
				text: "Get Started",
				onClick: onClick
			}}
			newProject={{
				text: secondaryButtonText,
				onClick: secondaryButtonOnClick
			}}
			secondaryButton={secondaryButton}
			padding="p-6"
			media={false}
			modalSteps={0}
		/>
	)
}

export default GetStarted
