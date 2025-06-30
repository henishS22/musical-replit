import { CollaborationInterest, CollaborationSetup } from "@/stores/user"

import CollaborationInterests from "../profile/profileTab/CollaborationInterests"

interface UserDetails {
	clb_interest: CollaborationInterest[]
	clb_setup: CollaborationSetup[]
	clb_availability: string
}

const CollabInterest = ({ userDetails }: { userDetails: UserDetails }) => {
	return (
		<div>
			<CollaborationInterests
				clb_interest={userDetails?.clb_interest}
				clb_setup={userDetails?.clb_setup}
				clb_availability={userDetails?.clb_availability}
			/>
		</div>
	)
}
export default CollabInterest
