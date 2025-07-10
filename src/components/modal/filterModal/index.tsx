import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"

import FilterOption from "@/components/ui/filterOption/FilterOption"
import { FILTER_MODAL } from "@/constant/modalType"
import { zodResolver } from "@hookform/resolvers/zod"
import {
	Accordion,
	AccordionItem,
	Button,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader
} from "@nextui-org/react"
import { z } from "zod"

import { useLibraryStore, useModalStore } from "@/stores"

import CustomModal from "../CustomModal"

const filterSchema = z
	.object({
		customError: z.string().optional(),
		genres: z.array(z.string()),
		instruments: z.array(z.string()),
		tags: z.array(z.string()),
		bpm: z.array(z.string())
	})
	.refine(
		(data) => {
			return (
				data.genres.length > 0 ||
				data.instruments.length > 0 ||
				data.tags.length > 0 ||
				data.bpm.length > 0
			)
		},
		{
			message: "Please select at least one filter option from any category",
			path: ["customError"]
		}
	)

export type FilterFormData = z.infer<typeof filterSchema>

interface FilterModalProps {
	onApplyFilters: (data: FilterFormData) => void
}

export function FilterModal({ onApplyFilters }: FilterModalProps) {
	const { hideCustomModal, customModalType } = useModalStore()
	const { tags, instruments, genres, appliedFilters, setData } =
		useLibraryStore()

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors }
	} = useForm<FilterFormData>({
		resolver: zodResolver(filterSchema),
		defaultValues: appliedFilters
	})

	const handleClearFilters = () => {
		reset()
		const clearedFilters: FilterFormData = {
			genres: [],
			instruments: [],
			tags: [],
			bpm: []
		}
		onApplyFilters(clearedFilters)
		setData("appliedFilters", clearedFilters)
		hideCustomModal()
	}

	const onSubmit = (data: FilterFormData) => {
		onApplyFilters(data)
		setData("appliedFilters", data)
		hideCustomModal()
	}

	useEffect(() => {
		if (customModalType === FILTER_MODAL) {
			reset(appliedFilters)
		}
	}, [customModalType, appliedFilters, reset])

	return (
		<CustomModal
			onClose={hideCustomModal}
			showModal={customModalType === FILTER_MODAL}
			size="full"
			modalHeaderClass={{
				base: "w-[340px] h-full absolute top-0 right-0 rounded-md",
				header: "border-b border-gray-200",
				body: "py-6",
				footer: "border-t border-gray-200"
			}}
		>
			<ModalContent>
				<ModalHeader className="flex justify-between items-center">
					<h3 className="text-lg font-semibold">Filter</h3>
					{/* <Button isIconOnly variant="light" onPress={hideCustomModal}>✕</Button> */}
				</ModalHeader>

				<ModalBody className="overflow-auto">
					<form
						onSubmit={handleSubmit(onSubmit)}
						className="h-full flex flex-col"
					>
						{errors?.customError?.message && (
							<div className="mb-4 p-3 text-sm text-red-500 bg-red-50 rounded-lg">
								{errors?.customError?.message}
							</div>
						)}
						<Accordion
							showDivider={false}
							selectionMode="multiple"
							defaultSelectedKeys={["genres"]}
						>
							<AccordionItem key="genres" title="Genre">
								<Controller
									name="genres"
									control={control}
									render={({ field }) => (
										<div className="flex flex-wrap gap-2">
											{genres?.map((genre) => (
												<FilterOption
													key={genre?._id}
													label={genre?.title}
													selected={field.value?.includes(genre?._id)}
													onPress={() => {
														const newValue = field.value?.includes(genre?._id)
															? field.value?.filter((v) => v !== genre?._id)
															: [...field.value, genre?._id]
														field.onChange(newValue)
													}}
												/>
											))}
										</div>
									)}
								/>
							</AccordionItem>

							<AccordionItem key="instruments" title="Instruments">
								<Controller
									name="instruments"
									control={control}
									render={({ field }) => (
										<div className="flex flex-wrap gap-2">
											{instruments?.map((instrument) => (
												<FilterOption
													key={instrument?._id}
													label={instrument?.title}
													selected={field.value.includes(instrument?._id)}
													onPress={() => {
														const newValue = field.value.includes(
															instrument?._id
														)
															? field.value.filter((v) => v !== instrument?._id)
															: [...field.value, instrument?._id]
														field.onChange(newValue)
													}}
												/>
											))}
										</div>
									)}
								/>
							</AccordionItem>

							<AccordionItem key="tags" title="Tags">
								<Controller
									name="tags"
									control={control}
									render={({ field }) => (
										<div className="flex flex-wrap gap-2">
											{tags?.map((tag) => (
												<FilterOption
													key={tag?._id}
													label={tag?.title}
													selected={field.value.includes(tag?._id)}
													onPress={() => {
														const newValue = field.value.includes(tag?._id)
															? field.value.filter((v) => v !== tag?._id)
															: [...field.value, tag?._id]
														field.onChange(newValue)
													}}
												/>
											))}
										</div>
									)}
								/>
							</AccordionItem>

							<AccordionItem key="bpm" title="BPM">
								<p className="text-gray-500">No options available</p>
							</AccordionItem>
						</Accordion>
					</form>
				</ModalBody>

				<ModalFooter className="flex flex-col gap-2">
					<Button
						className="bg-[#DDF5E5] text-[#1DB954] w-full"
						onPress={() => handleSubmit(onSubmit)()}
					>
						Apply Filters
					</Button>
					<Button
						variant="bordered"
						className="w-full text-[#1DB954]"
						onPress={handleClearFilters}
					>
						Clear Filters
					</Button>
				</ModalFooter>
			</ModalContent>
		</CustomModal>
	)
}
