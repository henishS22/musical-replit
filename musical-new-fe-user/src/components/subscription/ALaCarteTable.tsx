import { SUBSCRIPTION_MODAL } from "@/constant/modalType"
import { ALaCarteTableProps, GroupedAddon } from "@/types/subscription"
import {
	Button,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow
} from "@nextui-org/react"

import { useModalStore } from "@/stores"

export function ALaCarteTable({
	addonsData,
	selectedAddons
}: ALaCarteTableProps) {
	const { showCustomModal } = useModalStore()

	const groupedAddons = addonsData?.reduce<Record<string, GroupedAddon>>(
		(acc, addon) => {
			if (!acc[addon.name]) {
				acc[addon.name] = {
					name: addon.name,
					description: addon.description
				}
			}

			switch (addon.interval.toLowerCase()) {
				case "monthly":
					acc[addon.name].monthly = addon
					break
				case "yearly":
					acc[addon.name].yearly = addon
					break
				case "lifetime":
					acc[addon.name].lifetime = addon
					break
			}

			return acc
		},
		{}
	)

	const handleAddonSelect = (addon: GroupedAddon) => {
		// Filter out selected intervals
		const unselectedIntervals = {
			monthly:
				addon.monthly && !selectedAddons.includes(addon.monthly._id)
					? addon.monthly
					: null,
			yearly:
				addon.yearly && !selectedAddons.includes(addon.yearly._id)
					? addon.yearly
					: null,
			lifetime:
				addon.lifetime && !selectedAddons.includes(addon.lifetime._id)
					? addon.lifetime
					: null
		}

		// If there are any unselected intervals, open the modal
		if (
			unselectedIntervals.monthly ||
			unselectedIntervals.yearly ||
			unselectedIntervals.lifetime
		) {
			showCustomModal({
				customModalType: SUBSCRIPTION_MODAL,
				tempCustomModalData: {
					addonData: unselectedIntervals
				}
			})
		}
	}

	return (
		<div className="mt-16 max-w-[1200px] mx-auto px-4">
			<div className="text-center mb-8">
				<h2 className="text-[40px] font-bold leading-[100%] mb-3">
					A La Carte
				</h2>
				{/* <p className="text-[#858BA0] font-medium text-[14px] leading-[20px] tracking-normal max-w-[800px] mx-auto">
					Choose the features you need for a custom plan. The subscription
					pricing above the vertical split and function more like a menu
					(selecting which items to combine in the) personalized subscription
				</p> */}
			</div>

			<div className="w-full rounded-md overflow-x-auto">
				<Table
					aria-label="A La Carte pricing table"
					classNames={{
						base: "w-full",
						table: "min-w-full border-collapse",
						thead: "",
						tr: "!outline-none data-[focus-visible=true]:!outline-none hover:bg-[#f3f4f6]",
						th: "bg-transparent text-[#111827] px-8 py-5 font-bold text-[30px] leading-[100%] text-textPrimary border border-[#e5e7eb] border-b-0 !text-left",
						td: "border border-[#e5e7eb] py-[14px] px-8 font-medium text-[18px] leading-[26px] text-textPrimary [&:last-child]:py-[14px] [&:last-child]:px-[18px]"
					}}
					removeWrapper
				>
					<TableHeader>
						<TableColumn>Features</TableColumn>
						<TableColumn className="text-center">Monthly</TableColumn>
						<TableColumn className="text-center">Yearly</TableColumn>
						<TableColumn className="text-center">Lifetime</TableColumn>
						<TableColumn className="text-center">Action</TableColumn>
					</TableHeader>
					<TableBody>
						{Object.values(groupedAddons || {}).map((addon: GroupedAddon) => {
							const isMonthlySelected =
								addon.monthly?._id && selectedAddons.includes(addon.monthly._id)
							const isYearlySelected =
								addon.yearly?._id && selectedAddons.includes(addon.yearly._id)
							const isLifetimeSelected =
								addon.lifetime?._id &&
								selectedAddons.includes(addon.lifetime._id)

							return (
								<TableRow key={addon.name}>
									<TableCell className="whitespace-pre-line font-medium max-w-[300px]">
										{addon.description}
									</TableCell>
									<TableCell
										className={`text-center font-medium ${isMonthlySelected ? "bg-[#DDF5E5] text-textPrimary" : ""}`}
									>
										{addon.monthly ? `$${addon.monthly.price}` : "NA"}
										{isMonthlySelected && <span> (Selected)</span>}
									</TableCell>
									<TableCell
										className={`text-center font-medium ${isYearlySelected ? "bg-[#DDF5E5] text-textPrimary" : ""}`}
									>
										{addon.yearly ? `$${addon.yearly.price}` : "NA"}
										{isYearlySelected && <span> (Selected)</span>}
									</TableCell>
									<TableCell
										className={`text-center font-medium ${isLifetimeSelected ? "bg-[#DDF5E5] text-textPrimary" : ""}`}
									>
										{addon.lifetime ? `$${addon.lifetime.price}` : "NA"}
										{isLifetimeSelected && <span> (Selected)</span>}
									</TableCell>
									<TableCell className="text-center">
										<Button
											onPress={() => handleAddonSelect(addon)}
											className="w-full rounded-sm bg-[#1DB954] text-white font-medium hover:bg-[#19a64b] py-4 transition-all"
											size="md"
										>
											Select
										</Button>
									</TableCell>
								</TableRow>
							)
						})}
					</TableBody>
				</Table>
			</div>
		</div>
	)
}
