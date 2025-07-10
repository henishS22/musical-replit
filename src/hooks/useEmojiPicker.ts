import { useEffect, useState } from "react"

interface UseEmojiPickerProps {
	inputRef: React.RefObject<HTMLInputElement>
	emojiButtonRef: React.RefObject<HTMLButtonElement>
	message: string
	onMessageChange: (value: string) => void
}

export function useEmojiPicker({
	inputRef,
	emojiButtonRef,
	message,
	onMessageChange
}: UseEmojiPickerProps) {
	const [showEmojiPicker, setShowEmojiPicker] = useState(false)

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Element
			const isEmojiPicker = target.closest('[data-emoji-picker="true"]')
			const isEmojiButton = emojiButtonRef.current?.contains(target)

			if (showEmojiPicker && !isEmojiPicker && !isEmojiButton) {
				setShowEmojiPicker(false)
			}
		}

		document.addEventListener("mousedown", handleClickOutside)
		return () => document.removeEventListener("mousedown", handleClickOutside)
	}, [showEmojiPicker, emojiButtonRef])

	const onEmojiSelect = (emoji: { native: string }) => {
		if (!inputRef.current) return

		const cursor = inputRef.current.selectionStart || 0
		const newText =
			message.slice(0, cursor) + emoji.native + message.slice(cursor)
		onMessageChange(newText)

		inputRef.current.focus()
		inputRef.current.setSelectionRange(
			cursor + emoji.native.length,
			cursor + emoji.native.length
		)
	}

	const toggleEmojiPicker = () => setShowEmojiPicker(!showEmojiPicker)

	return {
		showEmojiPicker,
		toggleEmojiPicker,
		onEmojiSelect
	}
}
