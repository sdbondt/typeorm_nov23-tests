import { Request, Response } from "express"
import asyncHandler from "../handlers/asyncHandler"
import { AuthService } from "../services/AuthService"
import { UserRepository } from "../data-source"
import { CREATED, OK } from "../constants/statusCodes"


const authService = new AuthService(UserRepository)

// Signup route handler.
export const signup = asyncHandler<Request>(async (req: Request, res: Response) => {
    // Register a new user and get a access token.
    const token = await authService.signup(req.body)

    // Respond with success status and the token.
    res.status(CREATED).json({ 
        token,
     })
})

// Login route handler.
export const login = asyncHandler<Request>(async (req: Request, res: Response) => {
    // Authenticate a user and get a access token.
    const token = await authService.login(req.body)

    // Respond with success status and the token.
    res.status(OK).json({ 
        token
    })
})