import { Request, Response, NextFunction } from "express";
import { AutoloadService } from "../database/services/AutoloadService";
import Joi from "joi";

// // Схема валидации с использованием Joi
const platformSchema = Joi.object({
    platform: Joi.string().required(),
    managerId: Joi.string().required(),
});

export const getAvitoAutoloads = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Валидация параметров запроса
        const { error, value } = platformSchema.validate(req.params);
        if (error) {
            throw new Error('Invalid platform or managerId parameter');
        }

        const { platform, managerId } = value;

        const autoloadApi: AutoloadService = new AutoloadService();
        const autoloads = await autoloadApi.getAutoloadWhere({ platform: platform, managerId: managerId });

        res.status(200).json({
            autoloads,
        });
    } catch (err) {
        next(err); // Передача ошибки в централизованный обработчик ошибок
    }
};