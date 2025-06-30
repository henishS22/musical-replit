import { useState } from "react"

import { CollaborationPosts } from "./CollaborationPosts"
import TabBar from "./TabBar"

const CollaborationTab = () => {
	const [tab, setTab] = useState("created")
	return (
		<div>
			<TabBar tab={tab} setTab={setTab} />
			<CollaborationPosts tab={tab} />
		</div>
	)
}

export default CollaborationTab
