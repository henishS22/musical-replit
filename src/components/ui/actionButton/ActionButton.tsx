import { Button } from "@nextui-org/react"

interface ActionButtonsProps {
	onExistingProject?: () => void
	onNewProject?: () => void
	onSocialPost?: () => void
}

export function ActionButtons({
	onExistingProject,
	onNewProject,
	onSocialPost
}: ActionButtonsProps) {
	return (
		<div className="flex flex-col gap-3 items-center justify-center">
			<div className={`flex gap-3`}>
				<Button
					className="bg-btnColor text-white px-4 py-2 rounded-lg text-[13px] hover:bg-btnColorHover"
					onPress={onExistingProject}
				>
					Add to an existing project
				</Button>
				<Button
					className="font-bold rounded-md px-4 py-2 text-sm shadow transition-colors bg-videoBtnGreen text-[#0D5326]"
					onPress={onNewProject}
				>
					Start a new project
				</Button>
			</div>
			<Button
				className="w-full max-w-[352px] border border-[#DDF5E5] bg-transparent text-[#0D5326] font-bold rounded-md py-3 text-sm hover:bg-[#F4F4F4] transition-colors"
				onPress={onSocialPost}
			>
				Post to Social
			</Button>
		</div>
	)
}
