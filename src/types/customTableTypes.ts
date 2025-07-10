export interface Header<T> {
	title: string
	key: keyof T
}
export interface CustomTableProps<T> {
	headers: Header<T>[]
	data: T[]
	isLoading: boolean
	rowsPerPage?: number
	renderRow: (item: T, columnKey: keyof T, index: number) => React.ReactNode
	totalPages: number
	currentPage: number
	onPageChange: (page: number) => void
	onRowClick?: (item: T) => void
}
