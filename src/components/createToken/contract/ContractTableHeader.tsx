export const ContractTableHeader: React.FC = () => {
	return (
		<div className="grid grid-cols-[1fr_1fr_1fr] w-full p-3 gap-4">
			<div className="text-textGray text-xs font-medium leading-3 tracking-[-0.12px]">
				Name
			</div>
			<div className="text-textGray text-xs font-medium leading-3 tracking-[-0.12px]">
				Wallet
			</div>
			<div className="text-textGray text-xs font-medium leading-3 tracking-[-0.12px]">
				Split
			</div>
		</div>
	)
}
