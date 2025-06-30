import React from "react"

import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis
} from "recharts"

// Define the shape of your data
interface Data {
	date: string
	songTitle: number
	streams: number
	money: number
}

// Define the props for the CustomLineChart component
interface CustomLineChartProps {
	data: Data[]
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
				<p>Song Title: {payload[0].value.toLocaleString()}k</p>
				<p>Number of Streams: {payload[1].value.toLocaleString()}k</p>
				<p>Money Made: {payload[2].value.toLocaleString()}k</p>
			</div>
		)
	}
	return null
}

const CustomLineChart: React.FC<CustomLineChartProps> = ({ data }) => {
	return (
		<ResponsiveContainer width="98%" height={276}>
			<LineChart data={data}>
				<CartesianGrid vertical={false} horizontal={true} stroke="#EFEFEF" />
				<XAxis dataKey="date" axisLine={false} />
				<YAxis
					tickFormatter={(value) =>
						value > 999 ? `${(value / 1000).toFixed(0)}k` : value.toString()
					} // Add "k" only for values > 999
					axisLine={false}
				/>
				<Tooltip content={<CustomTooltip />} />
				<Line
					type="monotone"
					dataKey="songTitle"
					stroke="#2A85FF"
					strokeWidth={4}
				/>
				<Line
					type="monotone"
					dataKey="streams"
					stroke="#B5E4CA"
					strokeWidth={4}
				/>
				<Line
					type="monotone"
					dataKey="money"
					stroke="#B1E5FC"
					strokeWidth={4}
				/>
			</LineChart>
		</ResponsiveContainer>
	)
}

export default CustomLineChart
