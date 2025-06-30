declare namespace Express {
	export interface Response {
		[key: string]: any // eslint-disable-line
	}
	export interface Request {
		user: any // eslint-disable-line
		
		file: any // eslint-disable-line
		files: any // eslint-disable-line
		requestHash: string // eslint-disable-line
	}
}
