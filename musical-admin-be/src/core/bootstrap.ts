import { App } from '@core/globals'
import { Database } from '@core/database'
import JWTHelper from '@helpers/jwt'
import { Logger } from '@core/logger'

export default async () => {
	Logger.info('Inside Bootstrap')

	await connectDatabase()
	// await dataAdded()

	JWTHelper.GenerateKeys()
}

const connectDatabase = async () => {
	Logger.info('Inside connectDatabase')
	const database = new Database({
		url: App.Config.DB_CONNECTION_STRING,
	})
	await database.connect()
	App.Database = database
}

// const dataAdded = async () => {
// 	Logger.info('Inside dataAdded')

// 	const data = [
// 		{
// 			"name": "Set up musical account",
// 			"identifier": "set_up_musical_account",
// 			"points": 3,
// 			"occurrence": 1,
// 			"isActive": true,
// 			"createdById": "6708e8bf3e338c56db048143",
// 			"updatedById": "6708e8bf3e338c56db048143"
// 		},
// 		{
// 			"name": "Fill out profile - description, photo, instruments",
// 			"identifier": "fill_out_profile",
// 			"points": 3,
// 			"occurrence": 1,
// 			"isActive": true,
// 			"createdById": "6708e8bf3e338c56db048143",
// 			"updatedById": "6708e8bf3e338c56db048143"
// 		},
// 		{
// 			"name": "Invite other users to the platform that set up account",
// 			"identifier": "invite_users_platform",
// 			"points": 5,
// 			"occurrence": 1,
// 			"isActive": true,
// 			"createdById": "6708e8bf3e338c56db048143",
// 			"updatedById": "6708e8bf3e338c56db048143"
// 		},
// 		{
// 			"name": "Uploading a file (dropbox, google, hard drive)",
// 			"identifier": "upload_file",
// 			"points": 1,
// 			"occurrence": 1,
// 			"isActive": true,
// 			"createdById": "6708e8bf3e338c56db048143",
// 			"updatedById": "6708e8bf3e338c56db048143"
// 		},
// 		{
// 			"name": "Record using the mobile application",
// 			"identifier": "record_with_mobile_app",
// 			"points": 1,
// 			"occurrence": 1,
// 			"isActive": true,
// 			"createdById": "6708e8bf3e338c56db048143",
// 			"updatedById": "6708e8bf3e338c56db048143"
// 		},
// 		{
// 			"name": "Post a new collaboration to community",
// 			"identifier": "post_collaboration",
// 			"points": 3,
// 			"occurrence": 3,
// 			"isActive": true,
// 			"createdById": "6708e8bf3e338c56db048143",
// 			"updatedById": "6708e8bf3e338c56db048143"
// 		},
// 		{
// 			"name": "Create new project ",
// 			"identifier": "create_project",
// 			"points": 1,
// 			"occurrence": 3,
// 			"isActive": true,
// 			"createdById": "6708e8bf3e338c56db048143",
// 			"updatedById": "6708e8bf3e338c56db048143"
// 		},
// 		{
// 			"name": "Invite collaborators to a project that set up new account",
// 			"identifier": "invite_project_collaborators",
// 			"points": 5,
// 			"occurrence": 1,
// 			"isActive": true,
// 			"createdById": "6708e8bf3e338c56db048143",
// 			"updatedById": "6708e8bf3e338c56db048143"
// 		},
// 		{
// 			"name": "Start a Project chat",
// 			"identifier": "start_project_chat",
// 			"points": 1,
// 			"occurrence": 3,
// 			"isActive": true,
// 			"createdById": "6708e8bf3e338c56db048143",
// 			"updatedById": "6708e8bf3e338c56db048143"
// 		},
// 		{
// 			"name": "create a NFT",
// 			"identifier": "create_nft",
// 			"points": 5,
// 			"occurrence": 3,
// 			"isActive": true,
// 			"createdById": "6708e8bf3e338c56db048143",
// 			"updatedById": "6708e8bf3e338c56db048143"
// 		},
// 		{
// 			"name": "Accept mobile notifications",
// 			"identifier": "accept_mobile_notifications",
// 			"points": 5,
// 			"occurrence": 1,
// 			"isActive": true,
// 			"createdById": "6708e8bf3e338c56db048143",
// 			"updatedById": "6708e8bf3e338c56db048143"
// 		},
// 		{
// 			"name": "Connect wallet",
// 			"identifier": "connect_wallet",
// 			"points": 3,
// 			"occurrence": 1,
// 			"isActive": true,
// 			"createdById": "6708e8bf3e338c56db048143",
// 			"updatedById": "6708e8bf3e338c56db048143"
// 		},
// 		{
// 			"name": "Sell NFT",
// 			"identifier": "sell_nft",
// 			"points": 1,
// 			"occurrence": 1,
// 			"isActive": true,
// 			"createdById": "6708e8bf3e338c56db048143",
// 			"updatedById": "6708e8bf3e338c56db048143"
// 		},
// 		{
// 			"name": "share a NFT on social",
// 			"identifier": "share_nft_social",
// 			"points": 1,
// 			"occurrence": 5,
// 			"isActive": true,
// 			"createdById": "6708e8bf3e338c56db048143",
// 			"updatedById": "6708e8bf3e338c56db048143"
// 		},
// 		{
// 			"name": "Start a livestream for fans ",
// 			"identifier": "start_livestream_for_fans",
// 			"points": 3,
// 			"occurrence": 1,
// 			"isActive": true,
// 			"createdById": "6708e8bf3e338c56db048143",
// 			"updatedById": "6708e8bf3e338c56db048143"
// 		},
// 		{
// 			"name": "start an audio room for fans",
// 			"identifier": "start_audio_room_for_fans",
// 			"points": 3,
// 			"occurrence": 1,
// 			"isActive": true,
// 			"createdById": "6708e8bf3e338c56db048143",
// 			"updatedById": "6708e8bf3e338c56db048143"
// 		},
// 		{
// 			"name": "Sign up for Email",
// 			"identifier": "signup_email",
// 			"points": 3,
// 			"occurrence": 1,
// 			"isActive": true,
// 			"createdById": "6708e8bf3e338c56db048143",
// 			"updatedById": "6708e8bf3e338c56db048143"
// 		},
// 		{
// 			"name": "Sign up for Text",
// 			"identifier": "signup_text",
// 			"points": 3,
// 			"occurrence": 1,
// 			"isActive": true,
// 			"createdById": "6708e8bf3e338c56db048143",
// 			"updatedById": "6708e8bf3e338c56db048143"
// 		}
// 	];
// 	try {
// 		await App.Models.Gamification.insertMany(data);
// 		Logger.info('Data inserted successfully');
// 	} catch (error) {
// 		Logger.error('Error inserting data:', error);
// 	}

// }


