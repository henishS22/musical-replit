export const PERMISSION_DISPLAY_MAP = {
	VIEW_ONLY: "View only",
	EDITOR: "Editor",
	PRODUCER: "Producer",
	UPLOAD_DOWNLOAD: "Upload/Download",
	UPLOAD_ONLY: "Upload Only",
	DOWNLOAD_ONLY: "Download Only",
	OWNER: "Owner"
} as const

export const REVERSE_PERMISSION_MAP: Record<string, string> = {
	Editor: "EDITOR",
	Owner: "OWNER",
	Producer: "PRODUCER",
	"View only": "VIEW_ONLY",
	"Upload/Download": "UPLOAD/DOWNLOAD",
	"Upload Only": "UPLOAD_ONLY",
	"Download Only": "DOWNLOAD_ONLY"
}
