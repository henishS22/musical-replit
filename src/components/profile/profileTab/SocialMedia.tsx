"use client"

import React from "react"

interface SocialLinkProps {
	platform: string
	url: string
}

const SocialLink: React.FC<SocialLinkProps> = ({ platform, url }) => (
	<div className="flex flex-col flex-1 shrink basis-0 min-w-[240px] max-md:max-w-full">
		<div className="flex flex-wrap gap-2 items-center py-0.5 w-full max-md:max-w-full">
			<div className="gap-1 self-stretch my-auto text-sm font-semibold tracking-normal leading-6 text-neutral-700">
				{platform}
			</div>
		</div>
		<div className="overflow-hidden gap-2.5 self-stretch w-full text-sm font-medium tracking-normal leading-6 text-gray-500 rounded-xl max-md:max-w-full">
			{url}
		</div>
	</div>
)

const SocialMedia: React.FC<{ socialLinks: SocialLinkProps[] }> = ({
	socialLinks
}) => {
	return (
		<>
			<div className="flex mt-8 w-full rounded-sm bg-zinc-100 min-h-[1px] max-md:max-w-full" />
			<div className="flex flex-col mt-8 w-full max-md:max-w-full">
				<div className="flex flex-wrap gap-10 justify-between items-center w-full text-zinc-900 max-md:max-w-full">
					<div className="gap-4 self-stretch my-auto text-xl font-semibold tracking-tight leading-relaxed">
						Social Media
					</div>
				</div>
				<div className="flex flex-col mt-5 w-full whitespace-nowrap max-md:max-w-full">
					{[0, 2, 4].map((index) => (
						<div
							key={index}
							className="flex flex-wrap gap-8 items-start mt-5 w-full max-md:max-w-full"
						>
							<SocialLink
								platform={socialLinks[index].platform}
								url={socialLinks[index].url || "N/A"}
							/>
							<SocialLink
								platform={socialLinks[index + 1].platform}
								url={socialLinks[index + 1].url || "N/A"}
							/>
						</div>
					))}
				</div>
			</div>
		</>
	)
}

export default SocialMedia
