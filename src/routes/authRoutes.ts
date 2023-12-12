import express from 'express'
import { login, signup } from '../controllers/authController'
import { LOGIN_ROUTE, SIGNUP_ROUTE } from '../constants/routes'

const router = express.Router()

// Route for user registration.
router.post(SIGNUP_ROUTE, signup)

// Route for user authentication.
router.post(LOGIN_ROUTE, login)

export default router