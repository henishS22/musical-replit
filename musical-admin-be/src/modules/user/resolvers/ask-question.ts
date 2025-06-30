import { UserInputError } from 'apollo-server-errors'
import { Logger } from '@core/globals'
import { UserDoc } from '@models/user'
import Email from '@helpers/mail'

interface AskQuestionPayload {
	input: {
		subject: string
        description:string
        email:string
	}
}

interface Context {
	user: UserDoc
	dataSources: any
}

interface BlockUserResponse {
	message: string
	status: string
}

export const askQuestion = {
	Mutation: {
		async askQuestion(
			__: any,
			{ input }: AskQuestionPayload,
			{ user }: Context
		): Promise<BlockUserResponse> {
			Logger.info('Inside ask question Resolvers')
			try {
				if (!user)
					return { message: 'Please check the token. User details does not exist', status: 'error' }

				const { subject,description ,email} = input
                new Email({ to: process.env.ASK_QUESTION_TO, name: process.env.ASK_QUESTION_TO_NAME }).raw({subject,html:description,from:email})
				return { message: 'Question asked succesfully', status: 'success' }
			} catch (err) {
				Logger.error(`${err.message}`)
				throw new UserInputError(`${err.message}`)
			}
		},
	},
}
