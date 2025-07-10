import Savebtn from "@/components/ui/savebtn/savebtn"

interface FormLayoutProps {
	title: string
	children: React.ReactNode
	onNext: () => void
	buttonText?: string
	disabled?: boolean
}

const FormLayout = ({
	title,
	children,
	onNext,
	buttonText = "Next",
	disabled = false
}: FormLayoutProps) => {
	return (
		<div className="p-6 flex flex-col gap-[26px]">
			<h2 className="text-textPrimary font-bold text-[20px] leading-[32px] tracking-[-0.02em]">
				{title}
			</h2>
			<div className="flex flex-col gap-[26px]">{children}</div>
			<div className="flex justify-end">
				<Savebtn
					className="w-fit self-end bg-btnColor text-white px-4 py-2 rounded-lg text-[13px] hover:bg-btnColorHover leading-[24px] font-bold tracking-[-0.01em]"
					disabled={disabled}
					label={buttonText}
					onClick={onNext}
				/>
			</div>
		</div>
	)
}

export default FormLayout
