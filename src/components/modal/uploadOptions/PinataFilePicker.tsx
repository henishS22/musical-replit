import { useState } from "react"

import { CustomInput } from "@/components/ui"
import { shortenText } from "@/helpers"
import { UploadNewFileProps } from "@/types/uploadTypes"
import { Button } from "@nextui-org/react"
import { X } from "lucide-react"

import { useModalStore } from "@/stores"

interface FileData {
	name: string
	url: string
}

export default function PinataFilePicker({ onFileSelect }: UploadNewFileProps) {
	const [cid, setCid] = useState<string>("")
	const [file, setFile] = useState<FileData | null>(null)
	const [loader, setLoader] = useState<boolean>(false)
	const [uploadPercentage, setUploadPercentage] = useState<number>(0)

	const { hideCustomModal } = useModalStore()

	const updatePercentage = (percentage: number) => {
		setUploadPercentage(percentage)
	}

	const addTrackDetails = async () => {
		if (file) {
			setLoader(true)
			const downloadedBlob = await fetch(file.url).then((res) => res.blob())

			const mediaFile = new File(
				[downloadedBlob],
				`filename.${downloadedBlob.type.split("/")[1]}`,
				{ type: downloadedBlob.type }
			)

			onFileSelect(mediaFile, setLoader, updatePercentage)
			hideCustomModal()
		}
	}

	const retrieveFile = async () => {
		if (!cid) return
		const url = `https://gateway.pinata.cloud/ipfs/${cid}`
		const fileName = `${cid}`
		const fileData: FileData = { name: fileName, url }
		setFile(fileData)
	}

	const handleRemoveFile = () => {
		setFile(null)
	}

	return (
		<div className="w-full max-w-[500px] mx-auto bg-[#FCFCFC] rounded-xl">
			<div className="bg-[#FCFCFC] rounded-xl p-10">
				<div className="mb-8">
					<div className="w-full">
						<div className="mt-1">
							{file ? (
								<div className="flex items-center p-4 bg-white border border-gray-300 rounded-md">
									<p className="flex-grow text-sm text-gray-700">
										{shortenText(file.name, 30)}
									</p>
									<Button
										onPress={handleRemoveFile}
										className="ml-2 text-gray-400 hover:text-gray-500"
									>
										<X className="h-5 w-5" />
									</Button>
								</div>
							) : (
								<CustomInput
									label=""
									type="text"
									id="cid"
									placeholder="Enter IPFS CID"
									value={cid}
									onChange={(e) => setCid(e.target.value)}
								/>
							)}
						</div>
					</div>
				</div>

				<div className="flex justify-center items-center">
					<Button
						onPress={file ? addTrackDetails : retrieveFile}
						isLoading={loader}
						className="h-[40px] bg-btnColor text-white hover:bg-btnColor/90 rounded-[8px]"
					>
						{file
							? loader
								? `${uploadPercentage}% Uploading...`
								: "Upload"
							: "Retrieve File"}
					</Button>
				</div>
			</div>
		</div>
	)
}
