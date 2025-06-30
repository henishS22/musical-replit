import React, { useMemo } from "react"

import { CustomTableProps, Header } from "@/types/customTableTypes"
import {
	Pagination,
	Skeleton,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow
} from "@nextui-org/react"

import { NoDataFound } from "../noDataFound"

const CustomTable = <T,>({
	headers,
	data = [],
	isLoading,
	renderRow,
	totalPages,
	currentPage,
	onPageChange,
	onRowClick
}: CustomTableProps<T>) => {
	// Memoize BottomContent to prevent unnecessary re-renders
	const BottomContent = useMemo(() => {
		return (
			<div className="py-2 px-2 flex justify-between items-center ml-auto">
				<Pagination
					showControls
					classNames={{
						cursor: "bg-waveformBlue text-background"
					}}
					color="default"
					page={currentPage}
					total={totalPages}
					variant="light"
					onChange={onPageChange}
				/>
			</div>
		)
	}, [currentPage, totalPages, onPageChange])

	// Memoize table rows to reduce unnecessary re-renders
	const tableRows = useMemo(() => {
		if (isLoading) {
			return Array.from({ length: headers?.length || 0 }).map((_, index) => (
				<TableRow key={index}>
					{headers?.map((header: Header<T>, idx) => (
						<TableCell key={idx}>
							<Skeleton key={index} className="w-full h-[54px] rounded-lg" />
						</TableCell>
					))}
				</TableRow>
			))
		}

		return data?.map((item, index) => (
			<TableRow
				key={index}
				onClick={() => onRowClick && onRowClick(item)}
				className="cursor-pointer hover:bg-gray-100 transition-colors"
			>
				{headers?.map((header: Header<T>, index: number) => (
					<TableCell key={header?.key as string}>
						{renderRow(item, header?.key, index)}
					</TableCell>
				))}
			</TableRow>
		))
	}, [isLoading, data, headers, renderRow, onRowClick])

	return (
		<Table
			aria-label="Dynamic table with client-side pagination"
			bottomContent={data?.length > 0 ? BottomContent : null}
			classNames={{
				wrapper: "min-h-[222px]"
			}}
			removeWrapper
			topContentPlacement="outside"
		>
			<TableHeader>
				{headers && headers?.length > 0 ? (
					headers.map((header: Header<T>, index) => (
						<TableColumn key={index}>{header.title}</TableColumn>
					))
				) : (
					<TableColumn>No Headers</TableColumn>
				)}
			</TableHeader>
			<TableBody
				emptyContent={
					<div className="flex justify-center w-full">
						<NoDataFound />
					</div>
				}
			>
				{tableRows}
			</TableBody>
		</Table>
	)
}

export default CustomTable
