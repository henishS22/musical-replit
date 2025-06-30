// import { IBundler, Bundler } from '@biconomy/bundler'
// import { DEFAULT_ENTRYPOINT_ADDRESS, BiconomySmartAccountV2 } from '@biconomy/account'
// import {
// 	IPaymaster,
// 	BiconomyPaymaster,
// 	IHybridPaymaster,
// 	SponsorUserOperationDto,
// 	PaymasterMode,
// } from '@biconomy/paymaster'
// import { DEFAULT_ECDSA_OWNERSHIP_MODULE, ECDSAOwnershipValidationModule } from '@biconomy/modules'
// import { ChainId } from '@biconomy/core-types'
// import { Wallet, providers, ethers } from 'ethers'
// import { IBlockchainResponse, IExecuteContract } from '../interface'
// import ConfigInterface from '@config'
// const configs = ConfigInterface()
// const provider = new ethers.providers.JsonRpcProvider(configs.MATIC.RPC_PROVIDER)

// const paymaster: IPaymaster = new BiconomyPaymaster({
// 	paymasterUrl: configs.BICONOMY.PAYMASTER_URL,
// })

// export const fetchBiconomySmartAccount = async (privateKey: string) => {
// 	try {
// 		const chainId = 80002
// 		const wallet = new ethers.Wallet(privateKey, provider)
// 		const bundler: IBundler = new Bundler({
// 			bundlerUrl: `${configs.BICONOMY.BUNDLER_URL}`,
// 			chainId,
// 			entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
// 		})
// 		const module = await ECDSAOwnershipValidationModule.create({
// 			signer: wallet,
// 			moduleAddress: DEFAULT_ECDSA_OWNERSHIP_MODULE,
// 		})
// 		const rpcUrl = configs.BICONOMY.MATIC_RPC_URL.toString()
// 		const biconomyAccount = await BiconomySmartAccountV2.create({
// 			chainId,
// 			bundler,
// 			paymaster,
// 			entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
// 			defaultValidationModule: module,
// 			activeValidationModule: module,
// 			rpcUrl,
// 		})
// 		const smartAccountAddress = await biconomyAccount.getAccountAddress()
// 		console.log('smartAccountAddress', smartAccountAddress)
// 		return { biconomyAccount, smartAccountAddress }
// 	} catch (error) {
// 		console.log('error', error)
// 	}
// }
// export const executeContract = async ({
// 	privateKey,
// 	proceedAs,
// 	functionName,
// 	values,
// 	contractAddress,
// }: IExecuteContract): Promise<IBlockchainResponse> => {
// 	try {
// 		console.log(`Executing Smart Contract | Function - ${functionName}`)
// 		const { biconomyAccount } = await fetchBiconomySmartAccount(privateKey)
// 		const functionInstance = new ethers.utils.Interface([proceedAs])
// 		const data = functionInstance.encodeFunctionData(functionName, values)
// 		const transaction = {
// 			to: contractAddress,
// 			data: data,
// 		}
// 		const paymasterServiceData: SponsorUserOperationDto = {
// 			mode: PaymasterMode.SPONSORED,
// 			smartAccountInfo: {
// 				name: 'BICONOMY',
// 				version: '2.0.0',
// 			},
// 		}
// 		const partialUserOp = await biconomyAccount.buildUserOp([transaction], {
// 			paymasterServiceData,
// 		})
// 		const biconomyPaymaster = biconomyAccount.paymaster as IHybridPaymaster<SponsorUserOperationDto>

// 		try {
// 			const paymasterAndDataResponse = await biconomyPaymaster.getPaymasterAndData(
// 				partialUserOp,
// 				paymasterServiceData
// 			)
// 			partialUserOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData
// 			if (
// 				paymasterAndDataResponse.callGasLimit &&
// 				paymasterAndDataResponse.verificationGasLimit &&
// 				paymasterAndDataResponse.preVerificationGas
// 			) {
// 				// Returned gas limits must be replaced in your op as you update paymasterAndData.
// 				// Because these are the limits paymaster service signed on to generate paymasterAndData
// 				// If you receive AA34 error check here..

// 				partialUserOp.callGasLimit = paymasterAndDataResponse.callGasLimit
// 				partialUserOp.verificationGasLimit = paymasterAndDataResponse.verificationGasLimit
// 				partialUserOp.preVerificationGas = paymasterAndDataResponse.preVerificationGas
// 			}
// 		} catch (error) {
// 			console.log(`Transaction failed | Line 124 | biconomy.helper`)
// 			console.log(error)
// 			return {
// 				txnStatus: false,
// 				txnHash: null,
// 			}
// 		}
// 		const userOpResponse = await biconomyAccount.sendUserOp(partialUserOp)
// 		const transactionDetails = await userOpResponse.wait()
// 		const txnStatus = JSON.parse(transactionDetails.success.toString())
// 		const txnHash = transactionDetails.receipt.transactionHash
// 		if (!txnStatus) {
// 			console.log(`Transaction failed | TxnHash: ${txnHash}`)
// 			return {
// 				txnStatus,
// 				txnHash,
// 			}
// 		}

// 		console.log(`Transaction success | TxnHash: ${txnHash}`)

// 		const blockchainResponse = {
// 			txnStatus,
// 			txnHash,
// 		}
// 		return blockchainResponse
// 	} catch (error) {
// 		console.log('error', error)
// 		throw error
// 	}
// }
