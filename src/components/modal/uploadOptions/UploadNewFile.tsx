"use client"

import { ChangeEvent, useState } from "react"
import { toast } from "react-toastify"

import { fileNameCheck } from "@/app/api/mutation"
import { isValidFile } from "@/helpers"
import { UploadNewFileProps } from "@/types/uploadTypes"
import { Button } from "@nextui-org/react"
import { useMutation } from "@tanstack/react-query"
import { Upload, X } from "lucide-react"

import { useModalStore } from "@/stores"

type UploadingFile = {
	file: File
	progress: number
	loading: boolean
}

export function UploadNewFile({ onFileSelect }: UploadNewFileProps) {
	const [selectedFiles, setSelectedFiles] = useState<UploadingFile[]>([])
	// const [uploadPercentage, setUploadPercentage] = useState<number>(0)

	const [loader, setLoader] = useState<boolean>(false)

	const { hideCustomModal } = useModalStore()

	const { mutate: nameCheck } = useMutation({
		mutationFn: (val: Record<string, string[]>) => fileNameCheck(val),
		onSuccess: (data) => {
			if (!data?.status) {
				toast.error("Error: " + data?.message)
			}
		},
		onError: (error: Error) => {
			if (error instanceof Error) {
				toast.error("Error: " + error.message)
			} else {
				toast.error("An unknown error occurred.")
			}
		}
	})

	const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files
		if (!files) return

		//converting FileList to an array
		const filesArray = Array.from(files)

		const validFiles: UploadingFile[] = filesArray
			.filter((file) => {
				const isValid = isValidFile(file.name)
				if (!isValid) {
					toast.error(`Invalid file: ${file.name}`)
				}
				return isValid
			})
			.map((file) => ({
				file,
				progress: 0,
				loading: false
			}))

		if (validFiles.length === 0) return

		const fileNames = filesArray.map((item) => item.name)
		nameCheck({
			name: fileNames
		})

		setSelectedFiles(validFiles)

		// const file = event.target.files?.[0]
		// addState("size", file?.size)
		// addState("extension", file?.type.split("/")[1])
		// if (file) {
		// 	if (isValidFile(file.name)) {
		// 		setSelectedFile(file)
		// 	} else {
		// 		toast.error(
		// 			`Invalid file type. Accepted files: ${Object.keys(allowedExtensions).join(", ")}`
		// 		)
		// 		setSelectedFile(null)
		// 	}
		// }
	}

	const handleRemoveFile = (index: number) => {
		const updated = [...selectedFiles]
		updated.splice(index, 1)
		setSelectedFiles(updated)
	}

	// const updatePercentage = (percentage: number) => {
	// 	setUploadPercentage(percentage)
	// }

	const handleUpload = async () => {
		// if (selectedFile) {
		// 	await onFileSelect(selectedFile, setLoader, updatePercentage)
		// 	hideCustomModal()
		// }
		const updatedFiles = [...selectedFiles]
		setLoader(true)
		for (let i = 0; i < updatedFiles.length; i++) {
			updatedFiles[i].loading = true
			setSelectedFiles([...updatedFiles]) // trigger re-render

			const updatePercentage = (percent: number) => {
				updatedFiles[i].progress = percent
				setSelectedFiles([...updatedFiles]) // update progress
			}

			try {
				await onFileSelect(updatedFiles[i].file, () => {}, updatePercentage)
			} catch {
				toast.error(`Upload failed: ${updatedFiles[i].file.name}`)
			}

			updatedFiles[i].loading = false
			updatedFiles[i].progress = 100
			setSelectedFiles([...updatedFiles])
		}
		setLoader(false)
		hideCustomModal()
	}

	return (
		<div className="w-full max-w-[500px] mx-auto bg-[#FCFCFC] rounded-xl">
			<div className="bg-[#FCFCFC] rounded-xl p-10">
				<div className="mb-8">
					<div className="w-full">
						<div className="mt-1">
							{selectedFiles.length > 0 ? (
								selectedFiles.map((f, index) => (
									<div
										key={index}
										className="flex items-center justify-between p-4 bg-white border border-gray-300 rounded-md mb-2"
									>
										<div className="flex-grow text-sm text-gray-700 truncate">
											{f.file.name}
										</div>

										{f.loading ? (
											<div className="text-sm text-blue-500 ml-4 min-w-[100px]">
												{f.progress}% Uploading...
											</div>
										) : (
											<Button
												onPress={() => handleRemoveFile(index)}
												className="ml-4 text-gray-400 hover:text-gray-500 min-w-fit max-w-[20px]"
											>
												<X className="h-5 w-5" />
											</Button>
										)}
									</div>
								))
							) : (
								<label
									className="flex flex-col items-center justify-center w-full text-base font-bold tracking-normal leading-relaxed 
        bg-zinc-100 text-zinc-900 border-2 border-dashed rounded-lg outline-none transition-all 
        min-h-[200px] border-gray-300 cursor-pointer"
								>
									<Upload className="w-10 h-10 mb-3 text-gray-700" />
									<span className="flex items-center space-x-2">
										<span className="font-medium text-gray-600">
											Click to select a file to upload
										</span>
									</span>
									<input
										type="file"
										multiple
										onChange={handleFileChange}
										className="hidden"
									/>
								</label>
							)}
						</div>
					</div>
				</div>

				<div className="flex justify-center items-center">
					<Button
						onPress={handleUpload}
						className="w-auto h-[40px] bg-btnColor text-white hover:bg-btnColor/90 rounded-[8px]"
						disabled={!selectedFiles}
						isLoading={loader}
					>
						{loader ? `Uploading...` : "Upload"}
					</Button>
				</div>
			</div>
		</div>
	)
}
