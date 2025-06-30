// import { PROFILE_IMAGE } from "@/assets"
// import { ChatMessage } from "@/types/chat"

// interface UseMessageHandlersProps {
// 	message: string
// 	setMessage: (message: string) => void
// 	messages: ChatMessage[]
// 	setMessages: (messages: ChatMessage[]) => void
// 	selectedFile: File | null
// 	fileInputRef: React.RefObject<HTMLInputElement>
// 	messagesContainerRef: React.RefObject<HTMLDivElement>
// }

// export const useMessageHandlers = ({
// 	message,
// 	setMessage,
// 	messages,
// 	setMessages,
// 	selectedFile,
// 	fileInputRef,
// 	messagesContainerRef
// }: UseMessageHandlersProps) => {
// 	const formatFileSize = (bytes: number) => {
// 		if (bytes < 1024) return bytes + " B"
// 		else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
// 		else return (bytes / 1048576).toFixed(1) + " MB"
// 	}

// 	const sendMessage = () => {
// 		if (!message.trim() && !selectedFile) return

// 		const newMessage: ChatMessage = {
// 			id: messages.length + 1,
// 			user: {
// 				name: "You",
// 				avatar: PROFILE_IMAGE,
// 				time: new Date().toLocaleTimeString([], {
// 					hour: "2-digit",
// 					minute: "2-digit"
// 				})
// 			},
// 			message: message.trim(),
// 			...(selectedFile && {
// 				file: {
// 					name: selectedFile.name,
// 					size: formatFileSize(selectedFile.size),
// 					type: selectedFile.type,
// 					url: URL.createObjectURL(selectedFile)
// 				}
// 			})
// 		}

// 		setMessages([...messages, newMessage])
// 		setMessage("")

// 		if (fileInputRef.current) {
// 			fileInputRef.current.value = ""
// 		}

// 		// Scroll to bottom
// 		if (messagesContainerRef.current) {
// 			messagesContainerRef.current.scrollTop =
// 				messagesContainerRef.current.scrollHeight
// 		}
// 	}

// 	return { sendMessage }
// }
