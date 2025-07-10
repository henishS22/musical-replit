import { Button } from "@nextui-org/react"
import { Check, PlusIcon, XIcon } from "lucide-react"

const FilterOption = ({
	label,
	selected,
	onPress,
	classNames,
	icon = false,
	remove = false,
	onRemove
}: {
	label: string
	selected?: boolean
	onPress?: () => void
	classNames?: {
		base?: string
		label?: string
	}
	icon?: boolean
	remove?: boolean
	onRemove?: () => void
}) => {
	return (
		<Button
			onPress={onPress}
			className={`${classNames?.base} px-2 py-2 rounded-lg border transition-colors ${
				selected
					? "bg-[#1CB050] text-white border-green-500"
					: "border-hoverGray bg-transparent text-black"
			}`}
		>
			<div className="flex items-center gap-[5px]">
				{icon && (
					<>
						{!selected ? (
							<PlusIcon className="w-4 h-4" color={"#33383F"} />
						) : (
							<Check className="w-4 h-4" color={"white"} />
						)}
					</>
				)}

				<p className={classNames?.label}>{label}</p>
				{remove && (
					<XIcon
						className="w-4 h-4 bg-[#1CB050] rounded-full p-1"
						color={"white"}
						onClick={onRemove}
					/>
				)}
			</div>
		</Button>
	)
}

export default FilterOption
