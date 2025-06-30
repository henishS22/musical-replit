import React, { ReactNode } from "react"

import { DropdownConfig } from "@/types/breadcrumbTypes"
import { Modal, ModalContent } from "@nextui-org/react"

import { Breadcrumb } from "../breadcrumb/Breadcrumb"

interface CustomModalProps {
	size?:
		| "md"
		| "xs"
		| "sm"
		| "lg"
		| "xl"
		| "2xl"
		| "3xl"
		| "4xl"
		| "5xl"
		| "full" // Size of the modal
	className?: string
	showModal: boolean
	children: ReactNode
	onClose: () => void
	modalBodyClass?: string
	modalHeaderClass?: {
		base?: string
		header?: string
		body?: string
		footer?: string
	}
	backdropClass?: string
	isBreadcrumb?: boolean
	title?: string
	dropdownConfig?: DropdownConfig
	onBack?: () => void
}

const CustomModal: React.FC<CustomModalProps> = ({
	showModal = false,
	children,
	onClose,
	modalBodyClass,
	modalHeaderClass = {},
	size = "md",
	isBreadcrumb = false,
	title,
	dropdownConfig,
	onBack
}) => {
	return (
		<Modal
			key={`modal-${title}`}
			isOpen={showModal}
			size={size}
			onClose={onClose}
			scrollBehavior="outside"
			classNames={{
				closeButton: "absolute top-[0.8rem] right-[0.8rem] z-10",
				wrapper: "z-60 flex justify-center md:items-center",
				...modalHeaderClass
			}}
		>
			<ModalContent
				className={
					isBreadcrumb
						? `p-0 gap-0 bg-white shadow-lg max-h-screen rounded-2xl backdrop:blur ${modalBodyClass}`
						: modalBodyClass
				}
			>
				{isBreadcrumb && (
					<div className="flex items-center p-6 pb-0">
						<div className="ml-2">
							<Breadcrumb
								title={title || ""}
								// eslint-disable-next-line @typescript-eslint/ban-ts-comment
								// @ts-expect-error
								dropdownConfig={dropdownConfig}
								onBack={onBack || (() => {})}
							/>
						</div>
					</div>
				)}
				{children}
			</ModalContent>
		</Modal>
	)
}

export default CustomModal
