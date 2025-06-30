"use client"

import { useEffect } from "react"

import { EXCHANGE_CONFIRM_MODAL } from "@/constant/modalType"
import { Button } from "@nextui-org/react"

import { useModalStore } from "@/stores/modal"
import { useCheckApproval } from "@/hooks/blockchain/useCheckApproval"
import { useSetApprovalForAll } from "@/hooks/blockchain/useSetApprovalForAll"

import CustomModal from "../CustomModal"

export default function ExchangeConfirmModal({
	isPending
}: {
	isPending: boolean
}) {
	const { customModalType, hideCustomModal, tempCustomModalData } =
		useModalStore()

	const { data: isApproved, isPending: isApprovalCheckPending } =
		useCheckApproval()

	const {
		setApprovalForAll,
		isPending: isApprovalForAllPending,
		isSuccess: isApprovalForAllSuccess,
		error: isApprovalForAllError
	} = useSetApprovalForAll()

	const handleConfirm = () => {
		if (!isApproved) {
			setApprovalForAll()
		} else {
			if (tempCustomModalData?.onConfirm) {
				tempCustomModalData.onConfirm()
			}
		}
	}

	useEffect(() => {
		if (isApprovalForAllError) {
			console.error(isApprovalForAllError)
		}
		if (isApprovalForAllSuccess) {
			if (tempCustomModalData?.onConfirm) {
				new Promise((resolve) => setTimeout(resolve, 5000)).then(() => {
					tempCustomModalData.onConfirm()
				})
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isApprovalForAllSuccess, isApprovalForAllPending])

	return (
		<CustomModal
			showModal={customModalType === EXCHANGE_CONFIRM_MODAL}
			onClose={hideCustomModal}
			title="Exchange NFTs"
			modalBodyClass="max-w-[540px]"
		>
			<div className="p-6">
				<p className="font-semibold text-base text-inputLabel mb-[30px]">
					Exchange NFTs
				</p>
				<p className="font-semibold text-base text-center leading-[150%] text-[#7D8592] mb-[30px]">
					Are you sure you want to Exchange the selected NFT ? <br /> You will
					be notified if someone is intrested.
				</p>

				<div className="flex justify-end gap-[10px]">
					<Button
						type="button"
						onPress={hideCustomModal}
						className="px-5 py-3 gap-2 rounded-lg bg-[#DDF5E5] text-[#0D5326] font-bold"
					>
						Cancel
					</Button>

					<Button
						type="button"
						onPress={handleConfirm}
						isLoading={
							isPending || isApprovalCheckPending || isApprovalForAllPending
						}
						className="px-4 py-2 rounded-lg bg-btnColor text-white font-bold"
						isDisabled={
							isPending || isApprovalCheckPending || isApprovalForAllPending
						}
					>
						{!isApproved
							? "Approve Wallet"
							: isPending
								? "Confirming Exchange..."
								: "Confirm"}
					</Button>
				</div>
			</div>
		</CustomModal>
	)
}
