import { createThirdwebClient } from "thirdweb"

// Replace this with your client ID string
// refer to https://portal.thirdweb.com/typescript/v5/client on how to get a client ID
const clientId = '6bddc8e0e89fcf7f15d3efa3c08f104f'

if (!clientId) {
	throw new Error("No client ID provided")
}

export const client = createThirdwebClient({
	clientId
})
