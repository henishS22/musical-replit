"use client"

interface EmptyStateProps {
	text: string
}

export default function EmptyState({ text }: EmptyStateProps) {
	return (
		<div className="flex items-center justify-center h-[400px]">
			<h1 className="font-semibold text-[#D0D0D0] text-[32px] leading-[40px] tracking-[-0.03em] text-center">
				{text}
			</h1>
		</div>
	)
}
