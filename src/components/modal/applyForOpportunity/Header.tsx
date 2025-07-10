import React from "react"

interface HeaderProps {
	title: string
	description: string
}

const Header: React.FC<HeaderProps> = ({ title, description }) => {
	return (
		<div className="flex justify-between items-center w-full text-black max-w-[632px] max-md:max-w-full">
			<div className="flex gap-2 self-stretch my-auto min-h-[24px]" />
			<div className="flex flex-col self-stretch my-auto min-w-[240px] w-[632px] max-md:max-w-full">
				<div className="flex flex-wrap gap-10 justify-between items-center w-full text-base font-bold tracking-normal max-md:max-w-full">
					<div className="self-stretch my-auto">{title}</div>
				</div>
				<div className="mt-2 text-sm font-medium tracking-normal leading-6 max-md:max-w-full">
					{description}
				</div>
			</div>
		</div>
	)
}

export default Header
