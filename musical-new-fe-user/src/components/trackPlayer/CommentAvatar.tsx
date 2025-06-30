import type { FC } from "react"

interface CommentAvatarProps {
	initial: string
	size?: "sm" | "md" | "lg"
	color?: string
	onClick?: () => void
}

const CommentAvatar: FC<CommentAvatarProps> = ({
	initial,
	size = "md",
	color = "bg-blue-500",
	onClick
}) => {
	const sizeClasses = {
		sm: "w-5 h-5 text-[10px]",
		md: "w-6 h-6 text-xs",
		lg: "w-8 h-8 text-sm"
	}

	return (
		<div
			className={`${sizeClasses[size]} rounded-full ${color} flex items-center justify-center text-white cursor-pointer`}
			onClick={onClick}
		>
			{initial.toUpperCase()}
		</div>
	)
}

export default CommentAvatar
