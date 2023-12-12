import { Response, Request } from 'express'

// NotFoundHandler: middleware for handling requests to undefined routes.
const notFoundHandler = (req: Request, res: Response) => res.status(404).json({ message: 'Route not found.'})

export default notFoundHandler