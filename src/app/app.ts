import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import rateLimiter from 'express-rate-limit'
import morgan from 'morgan'

import notFoundHandler from '../handlers/notFoundHandler'
import errorHandler  from '../handlers/errorHandler'

import authRoutes from '../routes/authRoutes'
import taskRoutes from '../routes/taskRoutes'
import { AUTH_ROUTE, TASK_ROUTE } from '../constants/routes'
import auth from '../middleware/auth'

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))
app.use(rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10000
}))

app.use(AUTH_ROUTE, authRoutes)
app.use(TASK_ROUTE, auth, taskRoutes)

app.use(errorHandler)
app.use(notFoundHandler)

export default app