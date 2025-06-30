// import { App } from '@core/globals'
// import { UserInput, UserDoc } from '@models/user'
// import { Role } from '@core/constants/roles'

// interface SignupPayload {
// 	payload: UserInput
// }

// interface SignupResponse {
// 	message: string
// 	user: UserDoc | null
// }

// export const signUp = {
// 	Mutation: {
// 		signUp: async (__: any, { payload }: SignupPayload): Promise<SignupResponse> => {
// 			const { walletAddress, roleId } = payload

// 			// Check if { email } exists
// 			const existingEmailCount = await App.Models.User.find({
// 				walletAddress,
// 			}).countDocuments()
// 			if (existingEmailCount) {
// 				return {
// 					message: 'Email failed',
// 					user: null,
// 				}
// 			}

// 			const user = App.Models.User.build({
// 				walletAddress,
// 				roleId,
// 				accountTypeCode: Role.USER,
// 				username: walletAddress
// 			})

// 			return { message: 'Sign up', user }
// 		},
// 	},
// }
