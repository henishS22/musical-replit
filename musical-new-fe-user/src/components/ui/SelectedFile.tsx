import Image from "next/image"

import { Paperclip, X } from "lucide-react"

const SelectedFile = ({
	selectedFile,
	setSelectedFile
}: {
	selectedFile: File | null
	setSelectedFile: (file: File | null) => void
}) => {
	return (
		<div className="flex flex-wrap gap-2 ml-4 mt-3">
			<div className="relative group">
				<div className="w-12 h-12 rounded-lg overflow-hidden bg-[#F4F4F5]">
					{selectedFile?.type?.startsWith("image/") ? (
						<Image
							src={URL.createObjectURL(selectedFile)}
							alt={selectedFile.name}
							width={64}
							height={64}
							className="w-full h-full object-cover"
							unoptimized
						/>
					) : selectedFile?.type?.startsWith("video/") ? (
						<video
							className="w-full h-full object-cover"
							src={URL.createObjectURL(selectedFile)}
							disablePictureInPicture
							controls={false}
							muted
							playsInline
						>
							<source
								src={URL.createObjectURL(selectedFile)}
								type={selectedFile.type}
							/>
						</video>
					) : (
						<div className="w-full h-full flex items-center justify-center">
							<Paperclip className="w-6 h-6 text-gray-500" />
						</div>
					)}
				</div>
				<button
					onClick={() => setSelectedFile(null)}
					className="absolute -top-2 -right-2 border border-[#fff] w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
				>
					<X className="w-3 h-3 text-white" />
				</button>
			</div>
		</div>
	)
}

export default SelectedFile
