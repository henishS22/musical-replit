// import { App, Logger } from '@core/globals'
// import { ItemsDoc } from '@models/items'

// interface Edges {
// 	cursor: typeof App.ObjectId
// 	node: ItemsDoc
// }

// interface PreviewImage {
// 	edges: Edges[]
// 	walletAddress: string | null
// }

// export const previewImage = (node: ItemsDoc, walletAddress = null): ItemsDoc => {
// 	Logger.info('Inside previewImage function')
// 	if (node.isUnlockable && node.currentOwner !== walletAddress) {
// 		if (node.previewImage) {
// 			node.mediaUrl = node.previewImage
// 		}
// 	}
// 	node.previewImage = null
// 	return node
// }

// export const previewImages = ({ edges, walletAddress }: PreviewImage): Edges[] => {
// 	Logger.info('Inside previewImages function')
// 	return edges.map((el: Edges): any => {
// 		el.node = previewImage(el.node, walletAddress)
// 		return el
// 	})
// 	return edges
// }
