import { Request, Response } from "express";
import Joi from "joi";
import { AdService } from "../../database/services/AdService";
import { IAd } from "../../database/models/Ad";

// // Схема валидации с использованием Joi
const bodySchema = Joi.object({
    id: Joi.string().required(),
    field: Joi.string().required(),
});


export const updateAdFieldController = async (req: Request, res: Response) => {
    // Валидация параметров запроса
    const { error, value } = bodySchema.validate(req.body);

    if (error) {
        throw new Error('Invalid request body');
    }

    const { id, field } = value;

    console.log("[UPDATE AD FIELD]: ", id, field);

    const adService = new AdService();
    const result: IAd | null = await adService.updateAd(id, { platform: field });

    if (!result) {
        res.send({ message: `Объявление с id: ${id} не найден`, result: false });
        return;
    }

    res.send({ message: "Объявление успешно изменено", result: true, data: result });
}