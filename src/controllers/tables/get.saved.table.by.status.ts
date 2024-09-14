import { Request, Response } from "express";
import Joi from "joi";
import SavedTableService from "../../database/services/SavedTableService";
import { ISavedTable } from "../../database/models/SavedTable";
import { Types } from 'mongoose';

type ReturnedType = (ISavedTable & Required<{
    _id: Types.ObjectId;
}>)

// // Схема валидации с использованием Joi
const bodySchema = Joi.object({
    status: Joi.string().required(),
    managerId: Joi.string().required(),
});

export const getTableByStatus = async (req: Request, res: Response) => {
    const { error, value } = bodySchema.validate(req.body);

    if (error) {
        return res.send({
            message: "Не валидное тело запроса, проверте данные",
            error: error,
            result: false,
        });
    }

    const { status, managerId } = value;

    const savedTable: ReturnedType | undefined = await SavedTableService.getTableByStatusAndManagerId(status, managerId);

    if (!savedTable) {
        return res.send({
            message: "Не найдена таблица с указанным статусом и менеджером",
            result: false,
        });
    }

    return res.send({
        message: "Таблица успешно найдена",
        result: true,
        table: savedTable,
    });
}