export type ImageData = {
	dataUrl: string
	blob: Blob
} | null

export interface GeneratedImageResult {
	url: string
	file: File
}

export interface UploadNewFileProps {
	onFileSelect: (
		file: File,
		setLoader: (x: boolean) => void,
		updatePercentage: (percentage: number) => void
	) => Promise<void>
}
