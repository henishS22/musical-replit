interface ListBulletIconProps {
	width?: number
	height?: number
	className?: string
	fill?: string
}

export const ListBulletIcon: React.FC<ListBulletIconProps> = ({
	width = 20,
	height = 20,
	className,
	fill
}) => {
	return (
		<svg
			width={width}
			height={height}
			viewBox="0 0 20 20"
			fill={fill}
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M6.00024 4.75C6.00024 4.33579 6.33603 4 6.75024 4H17.2502C17.6645 4 18.0002 4.33579 18.0002 4.75C18.0002 5.16421 17.6645 5.5 17.2502 5.5H6.75024C6.33603 5.5 6.00024 5.16421 6.00024 4.75ZM6.00024 10C6.00024 9.58579 6.33603 9.25 6.75024 9.25H17.2502C17.6645 9.25 18.0002 9.58579 18.0002 10C18.0002 10.4142 17.6645 10.75 17.2502 10.75H6.75024C6.33603 10.75 6.00024 10.4142 6.00024 10ZM6.00024 15.25C6.00024 14.8358 6.33603 14.5 6.75024 14.5H17.2502C17.6645 14.5 18.0002 14.8358 18.0002 15.25C18.0002 15.6642 17.6645 16 17.2502 16H6.75024C6.33603 16 6.00024 15.6642 6.00024 15.25Z"
				fill={fill ? fill : "url(#paint0_linear_1817_40898)"}
			/>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M1.99023 4.75C1.99023 4.19772 2.43795 3.75 2.99023 3.75H3.00023C3.55252 3.75 4.00023 4.19772 4.00023 4.75V4.76C4.00023 5.31228 3.55252 5.76 3.00023 5.76H2.99023C2.43795 5.76 1.99023 5.31228 1.99023 4.76V4.75Z"
				fill={fill ? fill : "url(#paint1_linear_1817_40898)"}
			/>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M1.99023 15.25C1.99023 14.6977 2.43795 14.25 2.99023 14.25H3.00023C3.55252 14.25 4.00023 14.6977 4.00023 15.25V15.26C4.00023 15.8123 3.55252 16.26 3.00023 16.26H2.99023C2.43795 16.26 1.99023 15.8123 1.99023 15.26V15.25Z"
				fill={fill ? fill : "url(#paint2_linear_1817_40898)"}
			/>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M1.99023 10C1.99023 9.44772 2.43795 9 2.99023 9H3.00023C3.55252 9 4.00023 9.44772 4.00023 10V10.01C4.00023 10.5623 3.55252 11.01 3.00023 11.01H2.99023C2.43795 11.01 1.99023 10.5623 1.99023 10.01V10Z"
				fill={fill ? fill : "url(#paint3_linear_1817_40898)"}
			/>
			<defs>
				<linearGradient
					id="paint0_linear_1817_40898"
					x1="10.3555"
					y1="3.75"
					x2="11.1103"
					y2="16.2179"
					gradientUnits="userSpaceOnUse"
				>
					<stop stopColor="#1DB653" />
					<stop offset="1" stopColor="#0E5828" />
				</linearGradient>
				<linearGradient
					id="paint1_linear_1817_40898"
					x1="10.3555"
					y1="3.75"
					x2="11.1103"
					y2="16.2179"
					gradientUnits="userSpaceOnUse"
				>
					<stop stopColor="#1DB653" />
					<stop offset="1" stopColor="#0E5828" />
				</linearGradient>
				<linearGradient
					id="paint2_linear_1817_40898"
					x1="10.3555"
					y1="3.75"
					x2="11.1103"
					y2="16.2179"
					gradientUnits="userSpaceOnUse"
				>
					<stop stopColor="#1DB653" />
					<stop offset="1" stopColor="#0E5828" />
				</linearGradient>
				<linearGradient
					id="paint3_linear_1817_40898"
					x1="10.3555"
					y1="3.75"
					x2="11.1103"
					y2="16.2179"
					gradientUnits="userSpaceOnUse"
				>
					<stop stopColor="#1DB653" />
					<stop offset="1" stopColor="#0E5828" />
				</linearGradient>
			</defs>
		</svg>
	)
}
