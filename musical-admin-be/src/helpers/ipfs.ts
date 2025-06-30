/* eslint-disable no-restricted-syntax */
import axios from 'axios'
export const ipfsGet = async (ipfs_url) => {
	const response = await axios(ipfs_url)
	if (!response) throw new Error(response.statusText)

	return response.data
}
