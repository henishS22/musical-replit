import React from "react"

interface DiscoverIconProps {
	fillColor?: string
	className?: string
}

const DiscoverIcon: React.FC<DiscoverIconProps> = ({
	fillColor = "#0D0D0D",
	className
}) => {
	return (
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<path
				opacity="0.4"
				d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
				fill={fillColor}
			/>
			<path
				d="M14.3266 14.3268C16.2089 12.4445 16.6932 9.877 15.4084 8.59219C14.1236 7.30738 11.5562 7.79174 9.67385 9.67405C7.79154 11.5564 7.30717 14.1238 8.59198 15.4086C9.8768 16.6934 12.4443 16.2091 14.3266 14.3268Z"
				fill={fillColor}
			/>
		</svg>
	)
}

export default DiscoverIcon
