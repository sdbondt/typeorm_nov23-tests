export interface CustomErrorType extends Error {
    message: string;
    statusCode: number;
}

export type IError = Error | CustomErrorType