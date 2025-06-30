import React, { useState } from "react"

interface SearchDropdownProps {
	placeholder: string
	options: string[]
	onChange: (value: string) => void
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({
	placeholder,
	options,
	onChange
}) => {
	const [inputValue, setInputValue] = useState("")

	return (
		<div className="relative">
			{/* Input Field with Icon */}
			<div className="relative">
				<input
					type="text"
					placeholder={placeholder}
					value={inputValue}
					onChange={(e) => {
						setInputValue(e.target.value)
						onChange(e.target.value)
					}}
					className="w-full p-2 pr-10 border border-gray-300 rounded bg-white text-black"
				/>
			</div>

			{/* Conditional Dropdown List */}
			{inputValue && options.length > 0 && (
				<ul className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-md max-h-40 overflow-y-auto z-10">
					{options.map((option, index) => (
						<li
							key={index}
							onClick={() => {
								setInputValue(option)
								onChange(option)
							}}
							className="p-2 hover:bg-gray-200 cursor-pointer text-black"
						>
							{option}
						</li>
					))}
				</ul>
			)}
		</div>
	)
}

export default SearchDropdown
