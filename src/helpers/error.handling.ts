import { Response } from "express";
import { stringify } from "flatted";

export function handleError(res: Response, error: any, message: string = 'Failed request'): void {
    console.error(message, error);
    const errorObject = {
        message: error?.message,
        stack: error?.stack,
        result: false,
    };
    res.send({
        message: message,
        error: stringify(errorObject),
        result: false,
    });
}