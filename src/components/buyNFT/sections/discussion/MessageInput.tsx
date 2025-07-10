"use client"

import { useRef } from "react"

import { CustomInput } from "@/components/ui/customInput"
import data from "@emoji-mart/data"
import Picker from "@emoji-mart/react"
import { FilePlus, Smile } from "lucide-react"

import { useEmojiPicker } from "@/hooks/useEmojiPicker"

interface MessageInputProps {
	message: string
	selectedFile: File | null
	onMessageChange: (value: string) => void
	onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
	onFileRemove: () => void
	onSend: () => void
	fileInputRef: React.RefObject<HTMLInputElement>
}

export function MessageInput({
	message,
	selectedFile,
	onMessageChange,
	onFileSelect,
	onFileRemove,
	onSend,
	fileInputRef
}: MessageInputProps) {
	const inputRef = useRef<HTMLInputElement>(null)
	const emojiButtonRef = useRef<HTMLButtonElement>(null)
	const { showEmojiPicker, toggleEmojiPicker, onEmojiSelect } = useEmojiPicker({
		inputRef,
		emojiButtonRef,
		message,
		onMessageChange
	})

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault()
			onSend()
		}
	}

	return (
		<div className="px-6">
			<div className="flex flex-col gap-3">
				{selectedFile && (
					<div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
						<FilePlus className="w-5 h-5 text-gray-500" />
						<div className="flex-1">
							<p className="text-sm font-medium truncate">
								{selectedFile.name}
							</p>
							<p className="text-xs text-gray-500">{selectedFile.size} bytes</p>
						</div>
						<button
							onClick={onFileRemove}
							className="p-1 hover:bg-gray-200 rounded-full"
						>
							<span className="text-gray-500">×</span>
						</button>
					</div>
				)}

				<div className="flex items-center gap-6">
					<div className="flex items-center gap-6">
						<button ref={emojiButtonRef} onClick={toggleEmojiPicker}>
							<Smile className="w-5 h-5 cursor-pointer" color="#6F767E" />
						</button>
						<label className="cursor-pointer">
							<input
								type="file"
								ref={fileInputRef}
								onChange={onFileSelect}
								className="hidden"
								accept="image/*,.pdf,.doc,.docx,.txt"
							/>
							<FilePlus className="w-5 h-5" color="#6F767E" />
						</label>
					</div>
					<CustomInput
						ref={inputRef}
						type="text"
						value={message}
						onChange={(e) => onMessageChange(e.target.value)}
						placeholder="Message"
						endContent={
							<button
								onClick={onSend}
								disabled={!message.trim() && !selectedFile}
								className="bg-btnColor text-white rounded-lg hover:bg-btnColorHover px-4 pt-[7px] pb-[8px]"
							>
								<span className="font-bold text-[13px] leading-6 tracking-[-0.01em]">
									Send
								</span>
							</button>
						}
						classname="!mt-0 border-2 border-customGray !bg-hoverGray !shadow-none !p-3 !rounded-xl"
						wrapperClassName="!mt-0"
						mainWrapperClassName="flex-1"
						endContentClassName="!top-[6px] !right-[6px]"
						onKeyPress={handleKeyDown}
					/>
				</div>

				{showEmojiPicker && (
					<div
						className="absolute bottom-20 left-0 z-50"
						data-emoji-picker="true"
					>
						<Picker
							data={data}
							onEmojiSelect={onEmojiSelect}
							theme="light"
							previewPosition="none"
							skinTonePosition="none"
							navPosition="none"
							perLine={8}
							maxFrequentRows={0}
						/>
					</div>
				)}
			</div>
		</div>
	)
}
