declare module "quill-emoji" {
	interface QuillEmojiOptions {
		emojiToolbar: boolean
		emojiTextarea: boolean
		emojiShortname: boolean
	}
	const QuillEmoji: QuillEmojiOptions
	export default QuillEmoji
}
