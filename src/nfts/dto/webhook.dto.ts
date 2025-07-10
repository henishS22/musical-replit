export class EngineWebhookDto {
  chainId?: any;
  data?: any;
  value?: any;
  gasLimit?: any;
  nonce?: any;
  maxFeePerGas?: any;
  maxPriorityFeePerGas?: any;
  fromAddress?: any;
  toAddress?: any;
  gasPrice?: any;
  transactionType?: any;
  transactionHash?: any;
  signerAddress?: any;
  accountAddress?: any;
  target?: any;
  sender?: any;
  initCode?: any;
  callData?: any;
  callGasLimit?: any;
  verificationGasLimit?: any;
  preVerificationGas?: any;
  paymasterAndData?: any;
  userOpHash?: any;
  functionName?: any;
  functionArgs?: any;
  extension?: any;
  deployedContractAddress?: any;
  deployedContractType?: any;
  queuedAt?: any;
  processedAt?: any;
  sentAt?: any;
  minedAt?: any;
  cancelledAt?: any;
  retryCount?: any;
  retryGasValues?: any;
  retryMaxPriorityFeePerGas?: any;
  retryMaxFeePerGas?: any;
  errorMessage?: any;
  sentAtBlockNumber?: any;
  blockNumber?: any;
  queueId?: any;
  status?: any;
  [x: string]: any;
}

// export class EngineWebhookDto {
//   @IsNotEmpty()
//   @IsString()
//   event: string;

//   @IsNotEmpty()
//   @IsObject()
//   result: {
//     id?: string;
//     checkoutId?: string;
//     walletAddress?: string;
//     walletType?: string;
//     email?: string;
//     quantity?: number;
//     paymentMethod?: string;
//     networkFeeUsd?: number;
//     serviceFeeUsd?: number;
//     totalPriceUsd?: number;
//     createdAt?: string;
//     paymentCompletedAt?: string;
//     transferCompletedAt?: string;
//     claimedTokens?: {
//       collectionAddress?: string;
//       collectionTitle?: string;
//       tokens?: {
//         transferHash?: string;
//         transferExplorerUrl?: string;
//         tokenId?: string;
//         quantity?: number;
//       }[];
//     };
//     title?: string;
//     transactionHash?: string;
//     valueInCurrency?: string;
//     currency?: string;
//     metadata: {
//       [x: string]: any;
//     };
//     mintMethod?: any;
//     eligibilityMethod?: any;
//     contractArgs?: any;
//   };
// }
