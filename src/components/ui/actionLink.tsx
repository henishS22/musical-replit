"use client"

// import { useDisclosure } from "@nextui-org/react"

// import { CreateModal } from "../dashboard/create-module/create-modal"
import { useDynamicStore, useModalStore } from "@/stores"

interface ActionLinkProps {
	text: string
	className?: string
	modalType?: string
}

export function ActionLink({
	text,
	className = "",
	modalType = ""
}: ActionLinkProps) {
	// const { isOpen, onOpen, onOpenChange } = useDisclosure()
	const { showCustomModal } = useModalStore()
	const { removeState } = useDynamicStore()

	const handleOpenModal = () => {
		if (modalType) {
			removeState("trackId")
			showCustomModal({ customModalType: modalType })
		}
	}

	return (
		<>
			<button
				onClick={handleOpenModal}
				className={`inline-block pt-3 pb-6 text-[13px] font-bold text-[#1DB954] hover:text-[#1DB954]/90 ${className}`}
			>
				{text} →
			</button>
			{/* <CreateModal open={isOpen} onOpenChange={onOpenChange} /> */}
		</>
	)
}
