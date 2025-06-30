import React from "react"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

// Define the shape of your data
interface Data {
	name: string
	value: number
}

// Define the props for the CustomLineChart component
interface CustomDonutChartProps {
	data: Data[]
	color: string[]
	isLegend: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({
	active,
	payload,
	label
}: {
	active?: boolean
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	payload?: any[]
	label?: string
}) => {
	if (active && payload && payload.length) {
		return (
			<div
				style={{
					backgroundColor: "#333",
					padding: "10px",
					borderRadius: "8px",
					color: "#fff"
				}}
			>
				<p>{label}</p>
				<p>Weight: {payload[0].value.toLocaleString()}</p>
				{/* <p>Number of Streams: {payload[1].value.toLocaleString()}</p>
        <p>Money Made: {payload[2].value.toLocaleString()}</p> */}
			</div>
		)
	}
	return null
}

const CustomDonutChart: React.FC<CustomDonutChartProps> = ({
	data,
	color,
	isLegend = false
}) => {
	return (
		<div>
			<ResponsiveContainer width="100%" height={220}>
				<PieChart>
					<Pie
						data={data}
						dataKey="value"
						nameKey="name"
						cx="50%"
						cy="50%"
						innerRadius={75}
						outerRadius={100}
						fill="#8884d8"
						paddingAngle={-10}
						cornerRadius={100} // Rounded arcs
					>
						{data?.map((entry, index) => (
							<Cell key={`cell-${index}`} fill={color[index % color.length]} />
						))}
					</Pie>
					<Tooltip content={<CustomTooltip />} />
				</PieChart>
			</ResponsiveContainer>
			{isLegend && (
				<div className="lg:flex justify-center mt-5">
					{data?.map((entry, index) => (
						<div key={index} className="flex items-center mr-5">
							<div
								className="w-5 h-5 mr-2 rounded"
								style={{
									backgroundColor: color[index % color.length]
								}}
							></div>
							<span className="text-black">{entry.name}</span>
						</div>
					))}
				</div>
			)}
		</div>
	)
}

export default CustomDonutChart
