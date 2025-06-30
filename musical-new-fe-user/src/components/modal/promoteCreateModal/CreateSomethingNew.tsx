import Image from "next/image"

import Savebtn from "@/components/ui/savebtn/savebtn"

const CreateSomethingNew = ({
	icon,
	title,
	label1,
	label2,
	onClick1,
	onClick2
}: {
	icon: string
	title: string
	label1: string
	label2: string
	onClick1: () => void
	onClick2: () => void
}) => {
	return (
		<div className="p-6 pt-[26px]">
			<div className="flex flex-col items-center gap-[47px] p-[46px]">
				<div className="w-16 h-16 rounded-full bg-videoBtnGreen flex items-center justify-center">
					{icon && <Image src={icon} alt="Agent Icon" width={32} height={32} />}
				</div>
				<div className="text-center">
					<h3 className="text-textGray text-[15px] font-medium leading-6 tracking-[-0.01em] ">
						{title}
					</h3>
				</div>
				<div className="flex items-center gap-4">
					<Savebtn
						label={label1}
						onClick={() => {
							onClick1()
						}}
						className="py-2 px-4 bg-gradient-to-b from-[#1DB954] to-[#0D5326] text-white"
					/>
					<Savebtn
						label={label2}
						onClick={() => {
							onClick2()
						}}
						className="py-2 px-4 bg-gradient-to-b from-[#1DB954] to-[#0D5326] text-white"
					/>
				</div>
			</div>
		</div>
	)
}

export default CreateSomethingNew
