import { useRouter } from "next/navigation"

import { useModalStore } from "@/stores"

import GetStarted from "../../digitalAdsModal/common/GetStarted"

const MusicInfluencers = () => {
	const { hideCustomModal } = useModalStore()
	const router = useRouter()
	return (
		<GetStarted
			title="Work with Music Influencers"
			description="Leverage paid influencers to help your content go viral"
			onClick={() => {
				router.push("/influencers")
				hideCustomModal()
			}}
			secondaryButton={true}
		/>
	)
}

export default MusicInfluencers
