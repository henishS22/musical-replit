import cors from 'cors'
import express from 'express'

const app = express()

app.use(express.json({ limit: '1024mb' }))

app.use(function (req, res, next) {
	// res.header('Access-Control-Allow-Origin', 'YOUR-DOMAIN.TLD') // update to match the domain you will make the request from
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
	next()
})
app.use(express.static('public'))
if (process.env.NODE_ENV === 'development') {
	app.use(cors({ origin: '*' }))
}

export default app
