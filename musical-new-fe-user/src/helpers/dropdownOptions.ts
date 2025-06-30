import { toast } from "react-toastify"
import { useParams, useRouter } from "next/navigation"

import {
	CREATE_MODULE_MODAL,
	DIGITAL_ADS_MODAL,
	ENGAGE_MODAL,
	EXISTINGPRO_MODAL,
	GO_VIRAL_MODAL,
	PURCHASE_SUBSCRIPTION_MODAL
} from "@/constant/modalType"
import { DISTRO_NOT_APPROVED } from "@/constant/toastMessages"
import { resetModalSteps } from "@/helpers/modalStepHelpers"
import { ProjectResponse } from "@/types/dashboarApiTypes"

import {
	useAIChatStore,
	useDynamicStore,
	useModalStore,
	useUserStore
} from "@/stores"

export const usePromoteDropdown = () => {
	const router = useRouter()
	const { showCustomModal, hideCustomModal } = useModalStore()
	const { addState, removeState } = useDynamicStore()
	const { id } = useParams()

	const handleDropdownOption = (
		option: { type: string; value: string; title: string; description: string },
		modalType: string,
		setDropdownKey?: (value: string) => void
	) => {
		if (setDropdownKey) {
			setDropdownKey(option?.value)
		}
		if (
			option.value === "crowdfund_project" ||
			option.value === "landing_page"
		) {
			if (id) {
				addState("projectIdFromDetails", id)
			} else {
				removeState("projectIdFromDetails")
			}
			removeState("trackId")
			addState(
				"tokenDescription",
				"Help me record and market my new music on Guild, and get behind the scenes access to the process!"
			)
			addState("releaseModalWidth", "max-w-[540px]")
			showCustomModal({
				customModalType: EXISTINGPRO_MODAL,
				tempCustomModalData: {
					handleNext: () => {
						router.push("/create-token")
						hideCustomModal()
					},
					showProjectTracks: true
				}
			})
			return
		} else if (option?.value === "existing_content") {
			addState("isShare", true)
			router.push("/library")
			hideCustomModal()
		} else if (option?.type === DIGITAL_ADS_MODAL) {
			showCustomModal({
				customModalType: modalType,
				tempCustomModalData: {
					initialDropdownKey: option?.value
				}
			})
		} else if (option?.type === GO_VIRAL_MODAL) {
			addState("ProjectStartSolo", false)
			showCustomModal({
				customModalType: modalType,
				tempCustomModalData: {
					initialDropdownKey: option?.value
				}
			})
		} else if (option?.value === "schedule") {
			router.push("/schedules")
			hideCustomModal()
		} else if (option?.value === "fan_quest") {
			showCustomModal({
				customModalType: modalType
			})
		} else {
			removeState("CreateFlow")
			resetModalSteps()
			hideCustomModal()
			showCustomModal({
				customModalType: modalType
			})
			addState("promoteFlow", option?.value)
		}
	}

	return { handleDropdownOption }
}

export const useReleaseDropdown = () => {
	const router = useRouter()
	const { id } = useParams()
	const { showCustomModal, hideCustomModal } = useModalStore()
	const { addState } = useDynamicStore()
	const { subscriptionFeatures, userData } = useUserStore()

	const handleDropdownOption = (
		option: { type: string; value: string; title: string; description: string },
		modalType: string,
		tokenProject?: ProjectResponse
	) => {
		if (
			!subscriptionFeatures?.[11]?.available &&
			(option.value === "approval" ||
				option.value === "releaseAudio" ||
				option.value === "releaseVideo")
		) {
			showCustomModal({
				customModalType: PURCHASE_SUBSCRIPTION_MODAL
			})
		} else if (option.value === "approval") {
			router.push("/get-approval")
			hideCustomModal()
		} else if (option.value === "metadata") {
			if (!id) {
				showCustomModal({
					customModalType: modalType,
					tempCustomModalData: { dropdownValue: option?.value }
				})
			} else {
				addState("tokenProject", tokenProject)
				router.push("/create-track")
			}
		} else if (option.value === "releaseAudio") {
			if (userData?.isDistroApproved) {
				if (!id) {
					showCustomModal({
						customModalType: EXISTINGPRO_MODAL,
						tempCustomModalData: {
							handleNext: () => {
								hideCustomModal()
								router.push("/create-track")
							}
						}
					})
				} else {
					addState("tokenProject", tokenProject)
					router.push("/create-track")
				}
			} else {
				toast.error(DISTRO_NOT_APPROVED)
			}
		} else if (option.value === "releaseVideo") {
			addState("isReleaseVideo", true)
			addState("isShare", true)
			router.push("/library")
			hideCustomModal()
		} else {
			showCustomModal({
				customModalType: modalType,
				tempCustomModalData: { dropdownValue: option?.value }
			})
		}
	}

	return { handleDropdownOption }
}

export const useEngageDropdown = () => {
	const router = useRouter()
	const { showCustomModal, hideCustomModal } = useModalStore()
	const { addState, removeState } = useDynamicStore()
	const { id } = useParams()

	const handleDropdownOption = (
		option: { type: string; value: string; title: string; description: string },
		modalType: string
	) => {
		if (option.value === "livestream") {
			router.push("/livestream")
		} else if (option.value === "fan_contest") {
			addState("engageFlow", true)
			if (id) {
				addState("CreateOpportunity", {
					currentStep: 0,
					stepsCompleted: [false, false, false, false],
					selectedTracks: [],
					uploadedTrack: null,
					trackId: null,
					selectedProject: { _id: id },
					title: "",
					languages: [],
					skills: [],
					styles: [],
					duration: "",
					brief: "",
					track: []
				})
				router.push("/create-opportunity")
				return
			}
		} else if (option.value === "collab_artists") {
			router.push("/community")
		} else if (option.value === "collab_opp") {
			addState("collabOpp", true)
			if (id) {
				addState("CreateOpportunity", {
					currentStep: 0,
					stepsCompleted: [false, false, false, false],
					selectedTracks: [],
					uploadedTrack: null,
					trackId: null,
					selectedProject: { _id: id },
					title: "",
					languages: [],
					skills: [],
					styles: [],
					duration: "",
					brief: "",
					track: []
				})
				router.push("/create-opportunity")
				return
			}
		} else if (option.value === "pay_gate") {
			if (!id) {
				removeState("projectIdFromDetails")
			} else {
				addState("projectIdFromDetails", id)
			}
			removeState("trackId")
			addState(
				"tokenDescription",
				"Join my Fan Club on Guild for the first look at my work and come along for the ride!"
			)
			addState("releaseModalWidth", "max-w-[540px]")
			showCustomModal({
				customModalType: EXISTINGPRO_MODAL,
				tempCustomModalData: {
					handleNext: () => {
						router.push("/create-token")
						hideCustomModal()
					},
					showProjectTracks: true
				}
			})
			return
		} else if (option.value === "crowdfund_project") {
			if (!id) {
				removeState("projectIdFromDetails")
			} else {
				addState("projectIdFromDetails", id)
			}
			removeState("trackId")
			addState(
				"tokenDescription",
				"Help me record and market my new music on Guild, and get behind the scenes access to the process!"
			)
			addState("releaseModalWidth", "max-w-[540px]")
			showCustomModal({
				customModalType: EXISTINGPRO_MODAL,
				tempCustomModalData: {
					handleNext: () => {
						router.push("/create-token")
						hideCustomModal()
					},
					showProjectTracks: true
				}
			})
			return
		} else if (option.value === "issue_collectible") {
			if (!id) {
				removeState("projectIdFromDetails")
			} else {
				addState("projectIdFromDetails", id)
			}
			removeState("trackId")
			addState(
				"tokenDescription",
				"Shop limited edition collectibles with special perks from my tokens on Guild!!"
			)
			addState("releaseModalWidth", "max-w-[540px]")
			showCustomModal({
				customModalType: EXISTINGPRO_MODAL,
				tempCustomModalData: {
					handleNext: () => {
						router.push("/create-token")
						hideCustomModal()
					},
					showProjectTracks: true
				}
			})
			return
		}
		removeState("trackId")
		showCustomModal({
			customModalType: modalType,
			tempCustomModalData: {
				dropdownValue: option?.value,
				initialKey: "opportunity",
				onBack: () => {
					showCustomModal({ customModalType: ENGAGE_MODAL })
					removeState("collabOpp")
				},
				onClose: () => {
					removeState("engageFlow")
					removeState("collabOpp")
				}
			}
		})
	}

	return { handleDropdownOption }
}

export const useCreateDropdown = () => {
	const router = useRouter()
	const { id } = useParams()
	const { showCustomModal, hideCustomModal } = useModalStore()
	const { removeState, addState } = useDynamicStore()
	const { subscriptionFeatures } = useUserStore()
	const { clearLyrics } = useAIChatStore()
	const handleDropdownOption = (
		option: { type: string; value: string; title: string; description: string },
		modalType: string,
		setSelectedValue?: (value: string) => void
	) => {
		clearLyrics()
		if (setSelectedValue) {
			setSelectedValue(option.value)
		}
		removeState("engageFlow")
		if (!subscriptionFeatures?.[10]?.available && option.value === "visual") {
			showCustomModal({
				customModalType: PURCHASE_SUBSCRIPTION_MODAL
			})
		} else if (option.value === "opportunity") {
			if (id) {
				removeState("opportunity")
				removeState("trackId")
				addState("CreateOpportunity", {
					currentStep: 0,
					stepsCompleted: [false, false, false, false],
					selectedTracks: [],
					uploadedTrack: null,
					trackId: null,
					selectedProject: { _id: id },
					title: "",
					languages: [],
					skills: [],
					styles: [],
					duration: "",
					brief: "",
					track: []
				})
				router.push("/create-opportunity")
			} else {
				showCustomModal({
					customModalType: modalType,
					tempCustomModalData: {
						dropdownValue: option?.value,
						initialKey: option.value,
						onBack: () => {
							showCustomModal({ customModalType: CREATE_MODULE_MODAL })
						}
					}
				})
			}
		} else if (option.value === "upload") {
			hideCustomModal()
			if (!id) {
				removeState("linkTrack")
			} else {
				addState("linkTrack", id as string)
			}
			removeState("isReleaseTrack")
			removeState("trackFiles")
			router.push("/upload-new-work")
		} else if (option.value === "song") {
			showCustomModal({
				customModalType: modalType,
				tempCustomModalData: {
					dropdownValue: option?.value,
					initialKey: option.value,
					onBack: () => {
						showCustomModal({ customModalType: modalType })
					}
				}
			})
		} else {
			showCustomModal({
				customModalType: modalType,
				tempCustomModalData: {
					dropdownValue: option?.value,
					initialKey: option.value,
					onBack: () => {
						showCustomModal({ customModalType: CREATE_MODULE_MODAL })
					}
				}
			})
		}
	}

	return { handleDropdownOption }
}
