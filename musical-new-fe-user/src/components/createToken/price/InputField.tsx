import React from "react"
import Image from "next/image"

import { ETH_LABEL } from "@/assets"
import { LayersIcon } from "lucide-react"

interface InputFieldProps {
	label: string
	id: string
	value: string
	onChange: (value: string) => void
	readonly?: boolean
	polygonPrice?: number
	sepoliaPrice: number
}

const InputField: React.FC<InputFieldProps> = ({
	label,
	value,
	onChange,
	readonly = false,
	sepoliaPrice,
	id,
	polygonPrice
}) => {
	const chainPrice =
		process.env.NEXT_PUBLIC_TOKEN_CONTRACT_CHAIN === "137"
			? polygonPrice
			: sepoliaPrice

	return (
		<div className="flex flex-col flex-1 shrink basis-0">
			<label className="text-sm font-bold tracking-normal text-textGray leading-none">
				{label.split("").map((char, index) =>
					index === 0 || (label[index - 1] === " " && char !== "(") ? (
						<span key={index} className="">
							{char}
						</span>
					) : (
						<span key={index}>{char}</span>
					)
				)}
			</label>
			<div className="flex gap-2.5 items-center mt-3 w-full text-base font-semibold tracking-normal leading-relaxed  bg-white rounded-xl border-2 border-solid border-zinc-100">
				<div className=" p-[10px] my-auto w-12 h-12 text-center bg-zinc-100 ">
					{id === "initialQuantity" ? <LayersIcon className="w-6 h-6" /> : "$"}
				</div>

				<input
					type="number"
					value={value === "" ? "0" : value}
					className={`my-auto bg-transparent focus:outline-none ${
						label === "Total" ? "w-auto" : "w-full"
					}`}
					onChange={(e) => {
						const newValue = e.target.value
						if (id === "initialQuantity") {
							// For initialQuantity, ensure whole numbers only
							const wholeNumber = Math.floor(Number(newValue)).toString()
							if (newValue === "") {
								onChange("0")
							} else if (wholeNumber === "0" && value === "0") {
								onChange("0")
							} else if (
								value === "0" &&
								wholeNumber.length === 2 &&
								wholeNumber.startsWith("0")
							) {
								onChange(wholeNumber.slice(1))
							} else {
								onChange(wholeNumber)
							}
						} else {
							// Original logic for other fields
							if (newValue === "") {
								onChange("0")
							} else if (newValue === "0" && value === "0") {
								onChange("0")
							} else if (
								value === "0" &&
								newValue.length === 2 &&
								newValue.startsWith("0")
							) {
								onChange(newValue.slice(1))
							} else {
								onChange(newValue)
							}
						}
					}}
					readOnly={readonly}
				/>
				{label === "Total" && (
					<>
						<Image
							loading="lazy"
							src={ETH_LABEL}
							className="object-contain shrink-0 my-auto w-12 aspect-square"
							alt="etherum"
							width={48}
							height={48}
						/>
						<input
							type="number"
							value={(parseFloat(value) / (chainPrice as number)).toFixed(8)}
							className="my-auto bg-transparent focus:outline-none"
							readOnly={true}
						/>
					</>
				)}
			</div>
		</div>
	)
}

export default InputField
