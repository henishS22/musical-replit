import Image from "next/image"

import { QUEST_ICON, STORY_ICON } from "@/assets"
import { Button } from "@nextui-org/react"

function PingWeb3Protocol() {
	return (
		<div className="flex justify-center flex-col items-center p-6 gap-6">
			<div className="text-textGray text-[15px] font-[500] leading-[24px] tracking-[-0.01em]">
				Put your IP on the blockchain
			</div>
			<div className="flex gap-4">
				<Image src={STORY_ICON} alt="story" width={100} height={100} />
				<Image src={QUEST_ICON} alt="quest" width={100} height={100} />
			</div>
			<Button className="bg-btnColor text-white px-4 py-2 rounded-lg text-[13px] hover:bg-btnColorHover">
				Comming Soon
			</Button>
		</div>
	)
}

export default PingWeb3Protocol
