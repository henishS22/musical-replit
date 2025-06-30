import React from "react"
import Image, { StaticImageData } from "next/image"

import { Card, CardBody } from "@nextui-org/react"

interface MetricCardProps {
	title: string
	subtitle: string
	metrics: Array<{
		label: string
		value: string | React.ReactNode
		key: string
	}>
	icon: StaticImageData
	iconColor: string
	iconBgColor: string
	data: Record<string, string>
	isDemo: boolean
}

export function MetricCard({
	title,
	subtitle,
	metrics,
	icon,
	iconBgColor,
	data,
	isDemo
}: MetricCardProps) {
	return (
		<Card className="bg-[#FCFCFC] border shadow-none rounded-xl">
			<CardBody className="p-6">
				<div className="flex items-center justify-between mb-8">
					<div className={`rounded-full p-3 ${iconBgColor}`}>
						<div className="w-8 h-8 relative">
							<Image
								src={icon}
								alt={`${title} icon`}
								fill
								className="object-contain"
							/>
						</div>
					</div>
					<div className="flex flex-col items-end gap-2">
						<h3 className="text-lg font-bold text-right flex-1 ml-4">
							{title}
						</h3>
					</div>
				</div>
				{isDemo && (
					<p className="text-sm text-gray-500 self-center">Example Data</p>
				)}

				<p className="text-sm text-center font-semibold text-gray-900 mb-8">
					{subtitle}
				</p>

				<div className="flex items-stretch justify-evenly">
					{metrics.map((metric, index) => (
						<div key={index} className="flex items-center">
							<div className="text-center">
								<div className="text-base font-semibold mb-2">
									{title === "Organic"
										? !data[metric.key] || data[metric.key] === "0"
											? "N/A"
											: data[metric.key]
										: metric.value}
								</div>
								<p className="text-sm text-gray-500">{metric.label}</p>
							</div>

							{index < metrics.length - 1 && (
								<div className="h-12 w-px bg-gray-200 mx-6" />
							)}
						</div>
					))}
				</div>
			</CardBody>
		</Card>
	)
}
