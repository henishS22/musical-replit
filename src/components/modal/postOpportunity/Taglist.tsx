import React from "react"

interface TagListProps {
	tags: string[]
}

const TagList: React.FC<TagListProps> = ({ tags }) => {
	return (
		<div className="flex flex-wrap gap-2 items-center mt-4 w-full text-xs font-medium tracking-normal leading-6 whitespace-nowrap text-neutral-700">
			{tags?.length > 0 &&
				tags.map((tag, index) => (
					<div
						key={index}
						className="flex flex-col self-stretch px-2 my-auto rounded-lg border border-solid bg-zinc-100 border-zinc-100"
					>
						<div className="gap-1.5 self-stretch w-full">{tag}</div>
					</div>
				))}
		</div>
	)
}

export default TagList
