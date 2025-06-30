import axios from "axios"

interface IpfsUploadResponse {
	IpfsHash: string
	PinSize: number
	Timestamp: string
}

interface TokenMetadata {
	artwork: string
	trackId: string
	title: string
	description: string
	[key: string]: unknown
}

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY!
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY!
const PINATA_API_URL = "https://api.pinata.cloud/pinning"

// ✅ Helper function to get headers
const getHeaders = () => ({
	"Content-Type": "application/json",
	pinata_api_key: PINATA_API_KEY,
	pinata_secret_api_key: PINATA_SECRET_KEY
})

// ✅ Upload file (audio/video/image) to IPFS
export const uploadFileToIPFS = async (file: File | Blob): Promise<string> => {
	try {
		const formData = new FormData()
		formData.append("file", file)

		const response = await axios.post(
			`${PINATA_API_URL}/pinFileToIPFS`,
			formData,
			{
				headers: {
					pinata_api_key: PINATA_API_KEY,
					pinata_secret_api_key: PINATA_SECRET_KEY
				}
			}
		)

		if (!response.data || !response.data.IpfsHash) {
			console.error("Unexpected response from IPFS:", response.data)
			throw new Error("Invalid IPFS response")
		}

		return response.data.IpfsHash
	} catch (error) {
		console.error("Error uploading file to IPFS:", error)
		throw new Error("Failed to upload file to IPFS")
	}
}

// ✅ Upload base64 artwork to IPFS
export const uploadArtworkToIPFS = async (
	base64Data: string
): Promise<string> => {
	try {
		// Convert base64 to blob
		const byteString = atob(base64Data.split(",")[1])
		const mimeString = base64Data.split(",")[0].split(":")[1].split(";")[0]
		const ab = new ArrayBuffer(byteString.length)
		const ia = new Uint8Array(ab)

		for (let i = 0; i < byteString.length; i++) {
			ia[i] = byteString.charCodeAt(i)
		}

		const blob = new Blob([ab], { type: mimeString })

		// Upload blob to IPFS
		const ipfsHash = await uploadFileToIPFS(blob)
		return ipfsHash
	} catch (error) {
		console.error("Error uploading artwork to IPFS:", error)
		throw new Error("Failed to upload artwork to IPFS")
	}
}

// ✅ Upload JSON metadata to IPFS
export const uploadMetadataToIPFS = async (
	jsonData: TokenMetadata
): Promise<string> => {
	try {
		const response = await axios.post<IpfsUploadResponse>(
			`${PINATA_API_URL}/pinJSONToIPFS`,
			jsonData,
			{ headers: getHeaders() }
		)

		return response.data.IpfsHash
	} catch (error) {
		console.error("Error uploading metadata to IPFS:", error)
		throw new Error("Failed to upload metadata to IPFS")
	}
}

// ✅ Create Token Metadata and Upload to IPFS
export const createTokenMetadata = async ({
	artwork,
	trackId,
	title,
	description
}: {
	artwork: string
	trackId: string
	title: string
	description: string
}): Promise<string> => {
	try {
		// Upload artwork (assumes base64 format)
		const artworkHash = await uploadArtworkToIPFS(artwork)

		// Prepare metadata
		const metadata = {
			artwork: `${process.env.NEXT_PUBLIC_PINATA_BASE_URL}/${artworkHash}`,
			trackId,
			title,
			description
		}

		// Upload metadata JSON
		const metadataHash = await uploadMetadataToIPFS(metadata)
		return metadataHash
	} catch (error) {
		console.error("Error creating token metadata:", error)
		throw new Error("Failed to create token metadata")
	}
}
