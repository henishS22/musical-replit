import { Button } from "@nextui-org/react"

interface SavebtnProps {
	label: string
	onClick: () => void
	disabled?: boolean
	className?: string
	isLoading?: boolean
	type?: "button" | "submit" | "reset"
}

const Savebtn: React.FC<SavebtnProps> = ({
	label,
	onClick,
	disabled,
	className,
	isLoading,
	type
}) => {
	return (
		<Button
			type={type}
			isLoading={isLoading}
			onPress={onClick}
			isDisabled={disabled}
			className={`p-1 rounded-[8px] text-white ${
				disabled ? "opacity-50 cursor-not-allowed" : ""
			} ${className}`}
		>
			{label}
		</Button>
	)
}

export default Savebtn
