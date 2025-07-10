import { Button } from "@nextui-org/react"

export default function CommunityHeader({ onClick }: { onClick?: () => void }) {
	return (
		<div className="flex z-0 flex-wrap gap-10 justify-between items-center self-stretch w-full font-bold min-h-[43px] max-md:max-w-full">
			<div className="flex gap-4 items-center self-stretch my-auto font-bold text-[20px] leading-[24px] tracking-[-0.01em]">
				<div className="flex shrink-0 self-stretch my-auto w-4 h-8 bg-amber-200 rounded" />
				<div className="self-stretch my-auto font-bold text-[20px] leading-[24px] tracking-[-0.01em]">
					Community Discussion
				</div>
			</div>
			{onClick && (
				<Button
					className="flex gap-4 items-center self-stretch my-auto px-4 py-2 text-base tracking-normal leading-relaxed text-white bg-[#8A8A8A] rounded-xl border-2 border-solid border-zinc-100"
					onPress={onClick}
				>
					Add New Topic +
				</Button>
			)}
		</div>
	)
}
