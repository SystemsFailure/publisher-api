import { Response } from "express";

declare module 'express' {
    namespace Express {
        interface Response {
            sendResponse(status: number, message: string,  result: boolean, data?: any,): void;
        }
    }
}