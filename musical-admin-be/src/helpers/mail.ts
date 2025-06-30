import { App, Logger } from '@core/globals'
import mailjet from 'node-mailjet'
import { convert } from 'html-to-text'
import { renderFile } from 'ejs'

const mailer = mailjet.apiConnect(
	App.Config.MAIL_JET.USER,
	App.Config.MAIL_JET.PASSWORD,
)

export default class Email {
	touser: string
	name: string
	from: string

	constructor(dataObj: any) {
		this.touser = dataObj.to
		this.name = dataObj.name
		this.from = App.Config.MAIL_JET.FROM
	}

	// Send the actual email
	async send(template, subject, data) {
		Logger.info('Inside Mailjet Helper')

		let html: any
		if (template === 'raw') {
			html = data.html
		} else {
			await renderFile(
				`${__dirname}/../../public/${template}.ejs`,
				{
					data: { ...data, contactEmail: this.from },
					name: this.name,
					logo: `${App.Config.BACKEND_HOSTED_URL}/img/Logo.svg`,
				},
				(err, template) => {
					if (err) throw err
					html = template
				}
			)
		}

		const text = convert(html)

		const request = mailer.post('send', { version: 'v3.1' }).request({
			Messages: [
				{
					From: {
						Email: template === 'raw' ? data.from : App.Config.MAIL_JET.FROM,
						Name: 'Musical Team',
					},
					To: [{ Email: this.touser }],
					Subject: subject,
					TextPart: text,
					HTMLPart: html,
				},
			],
		})

		request
			.then((result) => {
				Logger.warn('Email sent via Mailjet')
			})
			.catch((err) => {
				Logger.error(err)
			})
	}

	async resetPassword(data: any) {
		await this.send('reset_password_otp', 'One Time Password', data)
	}
	async emailChanged(data: any) {
		await this.send('Email_Changed', 'Attention! Your Email has been updated!', data)
	}
	async enableAdmin(data: any) {
		await this.send(
			'Enable_admin',
			'Attention! You are enabled back as admin on Musical',
			data
		)
	}
	async disableAdmin(data: any) {
		await this.send(
			'Disabled_admin',
			'Attention! You are disabled as admin on Musical',
			data
		)
	}
	async deleteAdmin(data: any) {
		await this.send('Delete_admin', 'Attention! You have been deleted as admin!', data)
	}
	async createAdmin(data: any) {
		await this.send('Create_admin', 'Congratulations! You are our new admin!', data)
	}
	async updateNum(data: any) {
		await this.send('Update_num', 'Attention! Your contact number has been updated', data)
	}
	async raw(data: any) {
		await this.send('raw', data.subject, data)
	}

	async banUser(data: any) {
		await this.send('Ban_user', 'Attention! Your account has been banned!', data)
	}

	async UnBanUser(data: any) {
		await this.send('Unban_user', 'Congratulations! Your account has been unbanned!', data)
	}
}