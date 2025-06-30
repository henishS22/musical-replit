const InfoSection = ({
	title,
	content
}: {
	title: string
	content: string
}) => {
	return (
		<div className="flex flex-col gap-1">
			<span className="text-[14px] font-bold text-inputLabel leading-[21px] tracking-[-1.5%]">
				{title}
			</span>
			<span className="text-[14px] font-medium text-inputLabel leading-[21px] tracking-[-1.5%]">
				{content}
			</span>
		</div>
	)
}

export default InfoSection
