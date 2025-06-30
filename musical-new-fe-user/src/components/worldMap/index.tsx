import React, { useState } from "react"
import {
	ComposableMap,
	Geographies,
	Geography,
	Marker
} from "react-simple-maps"

import geoUrl from "@/constant/country.json" // GeoJSON data for the map

// Type for city data
interface Data {
	city_code: string
	city: string
	lng: number
	lat: number
	population: number
}

// Type for tooltip position
interface TooltipPosition {
	x: number
	y: number
}

interface CustomWorldMapProps {
	data: Data[]
}

const MapChart: React.FC<CustomWorldMapProps> = ({ data }) => {
	//   const [data, setData] = useState<Data[]>([]);
	//   const [maxValue, setMaxValue] = useState<number>(0);
	const [tooltipContent, setTooltipContent] = useState<string>("")
	const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({
		x: 0,
		y: 0
	})

	const handleMouseEnter = (
		e: React.MouseEvent<SVGCircleElement, MouseEvent>,
		city: string,
		population: number
	) => {
		const { clientX, clientY } = e
		setTooltipPosition({ x: clientX, y: clientY })
		setTooltipContent(`${city}: ${population.toLocaleString()}`)
	}

	const handleMouseLeave = () => {
		setTooltipContent("")
	}

	return (
		<div className="relative w-full h-[240px]">
			<ComposableMap
				projectionConfig={{ rotate: [-10, 0, 0] }}
				className="h-full w-full"
			>
				<Geographies geography={geoUrl}>
					{({ geographies }) =>
						geographies.map((geo) => (
							<Geography key={geo.rsmKey} geography={geo} fill="#d3e0f3" />
						))
					}
				</Geographies>
				{data.map(({ city_code, city, lng, lat, population }) => {
					return (
						<Marker
							key={city_code}
							coordinates={[lng, lat]}
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							onMouseEnter={(e: any) => handleMouseEnter(e, city, population)}
							onMouseLeave={handleMouseLeave}
							className="cursor-pointer"
						>
							<circle fill="#000" stroke="#FFF" r={8} />
						</Marker>
					)
				})}
			</ComposableMap>

			{/* Tooltip */}
			{tooltipContent && (
				<div
					style={{
						position: "absolute",
						top: tooltipPosition.y - 150, // Offset slightly from the mouse position
						left: tooltipPosition.x - 750, // Offset slightly from the mouse position
						padding: "5px 10px",
						backgroundColor: "rgba(0, 0, 0, 0.8)",
						color: "#FFF",
						borderRadius: "5px",
						pointerEvents: "none",
						transform: "translate(-50%, -50%)",
						zIndex: 10
					}}
				>
					{tooltipContent}
				</div>
			)}
		</div>
	)
}

export default MapChart
