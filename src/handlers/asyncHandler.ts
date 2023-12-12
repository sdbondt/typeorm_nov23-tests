import { NextFunction, Request, Response } from "express";

// asyncHandler: function to handle asynchronous operations in express routes.
// Wraps asynchronous route handler functions and passes errors to the next error handling middleware.
// Uses generic type T that can either be a Request or ExtendedRequest.
const asyncHandler = <T extends Request>(
    fn: (req: T, res: Response, next: NextFunction) => Promise<void>
) => async (req: T, res: Response, next: NextFunction) => {
    try {
        await fn(req, res, next);
    } catch (err) {
        next(err);
    }
};

export default asyncHandler;