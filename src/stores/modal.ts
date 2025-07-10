import { create } from "zustand"

interface ModalState {
	customModalOpen: boolean
	customModalType: string
	customModalTypeOne: string
	isModalLoading: boolean
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	tempCustomModalData: string | object | null | any
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	tempCustomModalData1: string | object | null | any
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	modalFunction: (() => void) | null | any
	showCustomModal: (payload: {
		customModalType?: string
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		tempCustomModalData?: string | object | null | any
		modalFunction?: () => void
	}) => void
	hideCustomModal: () => void
	showCustomModal1: (payload: {
		customModalTypeOne: string
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		tempCustomModalData1?: string | object | null | any
	}) => void
	hideCustomModal1: () => void
	setCustomModalLoading: (isLoading: boolean) => void
}

export const useModalStore = create<ModalState>((set) => ({
	customModalOpen: false,
	customModalType: "",
	customModalTypeOne: "",
	tempCustomModalData: null,
	modalFunction: null,
	isModalLoading: false,
	tempCustomModalData1: null,

	showCustomModal: ({ customModalType, tempCustomModalData, modalFunction }) =>
		set((state) => ({
			...state,
			customModalOpen: true,
			customModalType: customModalType || "",
			tempCustomModalData: tempCustomModalData || null,
			modalFunction: modalFunction || null
		})),

	hideCustomModal: () =>
		set((state) => ({
			...state,
			customModalOpen: false,
			customModalType: "",
			tempCustomModalData: null,
			modalFunction: null
		})),
	setCustomModalLoading: (isLoading: boolean) =>
		set((state) => ({
			...state,
			isModalLoading: isLoading
		})),

	showCustomModal1: ({ customModalTypeOne, tempCustomModalData1 }) =>
		set((state) => ({
			...state,
			tempCustomModalData1: tempCustomModalData1 || null,
			customModalTypeOne
		})),

	hideCustomModal1: () =>
		set((state) => ({
			...state,
			customModalTypeOne: ""
		}))
}))
