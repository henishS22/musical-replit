"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

import "react-quill/dist/quill.snow.css"
import "quill-emoji/dist/quill-emoji.css"

import {
	AlignJustify,
	Bold,
	Italic,
	Link,
	List,
	Smile,
	Underline
} from "lucide-react"

// ✅ Dynamically import ReactQuill (Fix SSR error)
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })

interface TextEditorProps {
	value: string
	onChange: (value: string) => void
}

const QUILL_MODULES = {
	toolbar: "#custom-toolbar",
	"emoji-toolbar": true,
	"emoji-textarea": false,
	"emoji-shortname": true
}
const TextEditor = ({ value, onChange }: TextEditorProps) => {
	const [isQuillLoaded, setIsQuillLoaded] = useState(false)

	useEffect(() => {
		let mounted = true

		const loadQuillModules = async () => {
			try {
				if (typeof window === "undefined") return

				const [{ default: Quill }, { default: Emoji }] = await Promise.all([
					import("quill"),
					import("quill-emoji")
				])

				if (!mounted) return

				Quill.register("modules/emoji", Emoji)
				setIsQuillLoaded(true)
			} catch (error) {
				console.error("Error loading Quill modules:", error)
			}
		}

		loadQuillModules()

		return () => {
			mounted = false
		}
	}, [])

	return (
		<div className="w-full rounded-xl bg-white">
			{isQuillLoaded && (
				<>
					<div
						id="custom-toolbar"
						className="border-b !px-3 !py-[14px] flex items-center gap-6 !border-2 !border-[#9A9FA540] rounded-t-xl !bg-[#FCFCFC] !border-b-0"
					>
						<button
							type="button"
							className="ql-bold flex h-9 w-9 items-center justify-center rounded-md hover:bg-gray-100 text-gray-600"
							aria-label="Bold"
						>
							<Bold size={18} color="#33383F" />
						</button>

						<button
							type="button"
							className="ql-italic flex h-9 w-9 items-center justify-center rounded-md hover:bg-gray-100 active:bg-gray-200 text-gray-600"
							aria-label="Italic"
						>
							<Italic size={18} color="#33383F" />
						</button>

						<button
							type="button"
							className="ql-underline flex h-9 w-9 items-center justify-center rounded-md hover:bg-gray-100 active:bg-gray-200"
							aria-label="Underline"
						>
							<Underline size={18} color="#33383F" />
						</button>

						<button
							type="button"
							className="ql-emoji flex h-9 w-9 items-center justify-center rounded-md hover:bg-gray-100 active:bg-gray-200"
							aria-label="Emoji"
						>
							<Smile size={18} color="#33383F" />
						</button>

						<button
							type="button"
							className="ql-link flex h-9 w-9 items-center justify-center rounded-md hover:bg-gray-100 active:bg-gray-200"
							aria-label="Insert link"
						>
							<Link size={18} color="#33383F" />
						</button>

						<button
							type="button"
							className="ql-list flex h-9 w-9 items-center justify-center rounded-md hover:bg-gray-100 active:bg-gray-200"
							value="bullet"
							aria-label="Bulleted list"
						>
							<List size={18} color="#33383F" />
						</button>

						<button
							type="button"
							className="ql-align flex h-9 w-9 items-center justify-center rounded-md hover:bg-gray-100 active:bg-gray-200"
							value="center"
							aria-label="Align center"
						>
							<AlignJustify size={18} color="#33383F" />
						</button>
					</div>

					<ReactQuill
						theme="snow"
						value={value}
						onChange={onChange}
						modules={QUILL_MODULES}
						className="h-[112px] !border-t-0 rounded-b-lg !bg-[#F4F4F4] !border-2 !border-[#9A9FA540]"
					/>
				</>
			)}
		</div>
	)
}

export default TextEditor
