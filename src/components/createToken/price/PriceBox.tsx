import React, { useState } from "react"
import { UseFormSetValue } from "react-hook-form"

import { fetchNftsCoinMarketCap } from "@/app/api/query"
import { useQuery } from "@tanstack/react-query"

import { TokenFormData } from ".."
// import ChainSelector from "./ChainSelector"
import InputField from "./InputField"

const PriceBox = ({
	setValue
}: {
	setValue: UseFormSetValue<TokenFormData>
}) => {
	const [values, setValues] = useState({
		initialQuantity: "0",
		price: "0",
		total: "0"
	})

	const { data: nftCapData } = useQuery({
		queryKey: ["nftCap"],
		queryFn: fetchNftsCoinMarketCap
	})

	const chainPrice =
		process.env.NEXT_PUBLIC_TOKEN_CONTRACT_CHAIN === "137"
			? nftCapData?.polygon
			: nftCapData?.sepolia

	const handleChange = (field: string, value: string) => {
		setValues((prev) => {
			const newValues = { ...prev, [field]: value }

			// Ensure calculations use numbers
			const totalNum =
				parseFloat(newValues.initialQuantity) * parseFloat(newValues.price)

			// Custom formatting for very small numbers
			const formattedTotal = totalNum.toLocaleString("en-US", {
				minimumFractionDigits: 8,
				maximumFractionDigits: 20,
				useGrouping: false
			})

			const priceInMatic =
				Number(formattedTotal) / Number(chainPrice.toFixed(2))

			setValue("total", priceInMatic.toString(), { shouldDirty: true }) // Update react-hook-form state
			return { ...newValues, total: formattedTotal }
		})
	}

	const inputFields = [
		{
			label: "Initial Quantity",
			id: "initialQuantity",
			value: values.initialQuantity,
			readonly: false
		},
		{ label: "Price (USD)", id: "price", value: values.price, readonly: false },
		{ label: "Total", id: "total", value: values.total, readonly: true }
	]

	return (
		<div className="flex flex-col mt-8 w-full ">
			<div className="flex flex-wrap gap-3 items-start w-full ">
				{inputFields.map((field) => (
					<InputField
						key={field.id}
						label={field.label}
						value={field.value}
						onChange={(value) => {
							handleChange(field.id, value)
							setValue(field.id as keyof TokenFormData, value, {
								shouldDirty: true
							}) // Register the input value with react-hook-form
						}}
						readonly={field.readonly}
						polygonPrice={nftCapData?.polygon}
						sepoliaPrice={nftCapData?.sepolia}
						id={field.id}
					/>
				))}
			</div>
			{/* <ChainSelector /> */}
		</div>
	)
}

export default PriceBox
