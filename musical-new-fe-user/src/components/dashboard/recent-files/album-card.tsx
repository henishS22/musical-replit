import Image from "next/image"

interface AlbumCardProps {
	title: string
	year: string
	type: string
	imageUrl: string
}

export function AlbumCard({ title, year, type, imageUrl }: AlbumCardProps) {
	return (
		<div className="bg-white rounded-lg overflow-hidden">
			<div className="relative aspect-square">
				<Image src={imageUrl} alt={title} fill className="object-cover" />
			</div>
			<div className="p-3">
				<h3 className="font-medium text-sm">{title}</h3>
				<p className="text-sm text-gray-500">
					{year} • {type}
				</p>
			</div>
		</div>
	)
}
