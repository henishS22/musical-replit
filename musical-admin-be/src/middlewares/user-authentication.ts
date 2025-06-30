import '@core/declarations'
import { Request, Response, NextFunction } from 'express'
import JWTHelper from '@helpers/jwt'

export const userAuthentication = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const token = req.headers.authorization?.split(' ')[1]

		const user = await JWTHelper.GetUser({ token })

		if (!user) {
			return res.status(401).json({ message: 'Unauthorized' })
		}

		req.user = user
		return next()
	} catch (error) {
		return res.status(500).json({
			message: 'Somthing went wrong',
		})
	}
}
