import Image from "next/image"

import { ASCAP_ICON, BMI_ICON, DDEX_ICON } from "@/assets"
import { Button } from "@nextui-org/react"

function FulfillWeb2() {
	return (
		<div className="flex justify-center flex-col items-center p-6 gap-6">
			<div className="text-textGray text-[15px] font-[500] leading-[24px] tracking-[-0.01em]">
				Register with PRO’s and DDEX
			</div>
			<div className="flex gap-4">
				<Image src={ASCAP_ICON} alt="ascap" width={100} height={100} />
				<Image src={BMI_ICON} alt="bmi" width={100} height={100} />
				<Image src={DDEX_ICON} alt="ddex" width={100} height={100} />
			</div>
			<Button className="bg-btnColor text-white px-4 py-2 rounded-lg text-[13px] hover:bg-btnColorHover">
				Comming Soon
			</Button>
		</div>
	)
}

export default FulfillWeb2
