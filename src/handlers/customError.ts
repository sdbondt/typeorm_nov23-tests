// CustomError: extends the built-in Error class to include a stuats code.
class CustomError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number) {
        super(message)
        this.statusCode = statusCode
    }
}

export default CustomError