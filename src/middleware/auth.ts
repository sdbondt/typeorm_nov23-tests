import { NextFunction, Response } from "express";
import jwt from 'jsonwebtoken'
import asyncHandler from "../handlers/asyncHandler";
import CustomError from "../handlers/customError";
import { AUTHENTICATION_INVALID, AUTHENTICATION_REQUIRED } from "../constants/errorMessages";
import { UNAUTHORIZED } from "../constants/statusCodes";
import { JwtPayload } from "jsonwebtoken";
import { UserRepository } from "../data-source";
import { AuthRequest } from "../types/requestType";

const auth = asyncHandler<AuthRequest>(async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Extract auth header from the request and ensure it's the right format.
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) throw new CustomError(AUTHENTICATION_REQUIRED, UNAUTHORIZED)

    // Extract token from the auth Header.
    // Token = 'Bearer ......'
    const token = authHeader.split(' ')[1]
    if (!token) throw new CustomError(AUTHENTICATION_REQUIRED, UNAUTHORIZED)

    // Define an empy payload object of the type jwt payload.
    let payload: JwtPayload = {}

    // Verify the jwt token and cast it to the payload object.
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload
    } catch (e) {
       throw new CustomError(AUTHENTICATION_INVALID, UNAUTHORIZED)
    }

    // Throw error if payload doesn't exist or isn't the right format.
    if (!payload || !payload.userId) throw new CustomError(AUTHENTICATION_INVALID, UNAUTHORIZED)

    // Retrieve user from database based on payload userId.
    const user = await UserRepository.findOne({
        where: {
            id: payload.userId
        }
    })

    // Throw error if no user exists.
    if (!user) throw new CustomError(AUTHENTICATION_INVALID, UNAUTHORIZED)

    // Append user to the request object for further use.
    req.user = user
    next()
})

export default auth