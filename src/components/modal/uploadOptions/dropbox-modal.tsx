import { useCallback, useState } from "react"
import DropboxChooser from "react-dropbox-chooser"
import { toast } from "react-toastify"

import { FILE_TYPE_ERROR } from "@/constant/errorMessage"
import { allowedAudioExtensionsArray } from "@/constant/fileContants"
import { UploadNewFileProps } from "@/types/uploadTypes"
import { Button } from "@nextui-org/react"
import { Upload } from "lucide-react"

import { useModalStore } from "@/stores"

interface DropboxFile {
	name: string
	link: string
	icon?: string
}

function DropboxModal({ onFileSelect }: UploadNewFileProps) {
	const [file, setFile] = useState<DropboxFile | null>(null)
	const [loader, setLoader] = useState<boolean>(false)
	const [uploadPercentage, setUploadPercentage] = useState<number>(0)

	const { hideCustomModal } = useModalStore()

	const handleFilePicker = useCallback((files: DropboxFile[]) => {
		if (files.length === 0) return

		const validFiles = files.filter((file) =>
			allowedAudioExtensionsArray.some((ext) => file.name.endsWith(ext))
		)

		if (validFiles.length === 0) {
			toast.error(FILE_TYPE_ERROR)
			return
		}

		setFile({ name: validFiles[0].name, link: validFiles[0].link })
	}, [])

	const updatePercentage = (percentage: number) => {
		setUploadPercentage(percentage)
	}

	const handleDataPicked = async () => {
		if (file) {
			setLoader(true)
			const downloadedBlob = await fetch(file.link).then((res) => res.blob())
			const selectedFile = new File(
				[downloadedBlob],
				`filename.${downloadedBlob.type.split("/")[1]}`,
				{ type: downloadedBlob.type }
			)

			onFileSelect(selectedFile, setLoader, updatePercentage)

			hideCustomModal()
		}
	}

	const handleRemoveFile = () => {
		setFile(null)
	}

	return (
		<div className="w-full max-w-[500px] mx-auto bg-[#FCFCFC] rounded-xl mb-8 flex items-center justify-center">
			<div className="cursor-pointer w-full p-10">
				{file ? (
					<div className="flex flex-col gap-4">
						<div className="flex items-center justify-between border p-4 rounded-md">
							<span className="text-sm">{file.name}</span>
							<Button size="sm" variant="light" onPress={handleRemoveFile}>
								Remove
							</Button>
						</div>
						<Button
							color="primary"
							className="bg-btnColor text-white self-center"
							fullWidth
							onPress={handleDataPicked}
							isLoading={loader}
						>
							{loader ? `${uploadPercentage}% Uploading...` : "Upload"}
						</Button>
					</div>
				) : (
					<DropboxChooser
						appKey={process.env.NEXT_PUBLIC_DROPBOX_APP_KEY || ""}
						success={handleFilePicker}
						cancel={() => {}}
						multiselect={false}
						extensions={allowedAudioExtensionsArray}
						linkType="direct"
						folderselect={false}
					>
						<div
							className="flex flex-col items-center justify-center w-full text-base font-bold tracking-normal leading-relaxed 
        bg-zinc-100 text-zinc-900 border-2 border-dashed rounded-lg outline-none transition-all 
        min-h-[200px] border-gray-300 py-20 cursor-pointer"
						>
							<Upload className="w-10 h-10 mb-3 text-gray-700" />
							<span className="font-medium text-gray-600">
								Click to select a file from Dropbox
							</span>
						</div>
					</DropboxChooser>
				)}
			</div>
		</div>
	)
}

export default DropboxModal
