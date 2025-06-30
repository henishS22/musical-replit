import React from "react"

import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis
} from "recharts"
import { LayoutType } from "recharts/types/util/types"

// Define the shape of your data
interface Data {
	range: string
	percentage: number
}

// Define the props for the CustomLineChart component
interface CustomBarChartProps {
	data: Data[]
	layout?: LayoutType
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
				<p>
					{payload[0].payload.range}: {payload[0].value}%
				</p>
			</div>
		)
	}
	return null
}

const CustomBarChart: React.FC<CustomBarChartProps> = ({
	data,
	layout = "vertical"
}) => {
	const [activeIndex, setActiveIndex] = React.useState<number | null>(null)
	const DEFAULT_COLOR = "#B5E4CA" // Normal bar color
	const HOVER_COLOR = "#2A85FF" // Bar color on hover
	const handleMouseEnter = (index: number) => {
		setActiveIndex(index)
	}

	const handleMouseLeave = () => {
		setActiveIndex(null)
	}
	return (
		<ResponsiveContainer width="98%" height={270}>
			<BarChart
				layout={layout}
				data={data}
				margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
			>
				<CartesianGrid horizontal={false} vertical={true} stroke="#EFEFEF" />
				<XAxis
					type="number"
					domain={[0, 20]} // Adjust max percentage based on your data
					tickFormatter={(tick) => `${tick}%`}
				/>
				<YAxis
					type="category"
					dataKey="range"
					tick={{ fontSize: 12, fontWeight: "bold" }}
				/>
				<Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
				<Bar
					dataKey="percentage"
					barSize={16}
					radius={[2, 2, 2, 2]} // Rounded corners
					onMouseLeave={handleMouseLeave}
				>
					{data.map((entry, index) => (
						<Cell
							key={`cell-${index}`}
							fill={index === activeIndex ? HOVER_COLOR : DEFAULT_COLOR}
							onMouseEnter={() => handleMouseEnter(index)}
							className="cursor-pointer"
						/>
					))}
				</Bar>
			</BarChart>
		</ResponsiveContainer>
	)
}

export default CustomBarChart
