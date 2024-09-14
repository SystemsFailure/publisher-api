import express, { NextFunction, Request, Response } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { uploadMiddleware } from "../middleware/upload.middleware";
import { uploadAdsFiles } from "../helpers/multer.ads.files.config";

// Определение типа для контроллеров маршрутов
type ControllerWithoutNextFunction = (req: Request, res: Response, next: NextFunction) => Promise<void>;

type Controller = (req: Request, res: Response, next?: NextFunction) => Promise<void | Response<any, Record<string, any>>> | ControllerWithoutNextFunction;

type MiddlewareBase = (req: Request, res: Response, next: express.NextFunction) => Promise<express.Response<any, Record<string, any>> | undefined>

// Определение типа для маршрутов
type Route = {
    path: string;
    middleware?: Array<typeof authMiddleware | typeof uploadMiddleware | typeof uploadAdsFiles.array> | MiddlewareBase;
    controller: Controller;
};

// Определение типа для всех маршрутов
export type Routes = {
    get: Route[];
    post: Route[];
    put: Route[];
    delete: Route[];
};