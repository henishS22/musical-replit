import React from "react"

interface HomeIconProps {
	fillColor?: string
	className?: string
}

const HomeIcon: React.FC<HomeIconProps> = ({
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
				d="M20.0383 6.81994L14.2783 2.78994C12.7083 1.68994 10.2983 1.74994 8.78828 2.91994L3.77828 6.82994C2.77828 7.60994 1.98828 9.20994 1.98828 10.4699V17.3699C1.98828 19.9199 4.05828 21.9999 6.60828 21.9999H17.3883C19.9383 21.9999 22.0083 19.9299 22.0083 17.3799V10.5999C22.0083 9.24994 21.1383 7.58994 20.0383 6.81994Z"
				fill={fillColor}
			/>
			<path
				d="M12 18.75C11.59 18.75 11.25 18.41 11.25 18V15C11.25 14.59 11.59 14.25 12 14.25C12.41 14.25 12.75 14.59 12.75 15V18C12.75 18.41 12.41 18.75 12 18.75Z"
				fill="white"
			/>
		</svg>
	)
}

export default HomeIcon
