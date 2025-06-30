import { useEffect, useState } from "react"

import {
	ChannelHeader,
	useChannelStateContext,
	useChatContext
} from "stream-chat-react"

interface ChannelUser {
	name: string
	online: boolean
}

interface PresenceChangedEvent {
	user?: { id: string }
}

const CustomChannelHeader = () => {
	const { client } = useChatContext()
	const { channel } = useChannelStateContext()
	const [channelUsers, setChannelUsers] = useState<ChannelUser[]>([])

	useEffect(() => {
		const updateChannelUsers = (event?: PresenceChangedEvent) => {
			if (!event || channel.state.members[event.user?.id ?? ""] !== undefined) {
				setChannelUsers(
					Object.values(channel.state.members).map((user) => ({
						name: user.user_id ?? "Unknown",
						online: !!user.user?.online
					}))
				)
			}
		}

		updateChannelUsers()

		client.on("user.presence.changed", updateChannelUsers)

		return () => {
			client.off("user.presence.changed", updateChannelUsers)
		}
	}, [client, channel])

	return (
		<div>
			<ChannelHeader />
			{channelUsers.map((member) => (
				<div key={member.name} className="hidden">
					<span>{member.online ? "online" : "offline"}</span>
				</div>
			))}
		</div>
	)
}

export default CustomChannelHeader
