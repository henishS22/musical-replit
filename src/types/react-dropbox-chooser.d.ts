/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "react-dropbox-chooser" {
	import { ComponentType, ReactNode } from "react"

	interface DropboxChooserProps {
		children: ReactNode
		appKey: string
		success: (files: any[]) => void
		cancel: () => void
		multiselect: boolean
		extensions: string[]
		linkType: string
		folderselect: boolean
	}

	const DropboxChooser: ComponentType<DropboxChooserProps>

	export default DropboxChooser
}
