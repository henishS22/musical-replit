import { CustomDropdown } from "@/components/ui/dropdown/CustomDropdown"
import { BreadcrumbProps } from "@/types/breadcrumbTypes"
import { BreadcrumbItem, Breadcrumbs, Button } from "@nextui-org/react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function Breadcrumb({ title, dropdownConfig, onBack }: BreadcrumbProps) {
	return (
		<div className="flex items-center">
			<Button
				isIconOnly
				variant="bordered"
				// size="sm"
				onPress={onBack}
				className="min-w-0 p-2 h-auto bg-transparent hover:bg-transparent border border-[#E8ECEF] rounded-lg"
			>
				<ChevronLeft className="w-5 h-5 text-gray-600" />
			</Button>

			<Breadcrumbs
				separator={<ChevronRight className="w-4 h-4" />}
				classNames={{
					base: "ml-2",
					list: "gap-2"
				}}
			>
				<BreadcrumbItem
					className="text-sm font-semibold text-textPrimary"
					classNames={{
						item: "text-sm font-semibold text-textPrimary"
					}}
				>
					{title}
				</BreadcrumbItem>
				{dropdownConfig && (
					<BreadcrumbItem>
						<CustomDropdown config={dropdownConfig} />
					</BreadcrumbItem>
				)}
			</Breadcrumbs>
		</div>
	)
}
