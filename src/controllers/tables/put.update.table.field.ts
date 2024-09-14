import { Request, Response } from "express";
import { ISavedTable } from "../../database/models/SavedTable";
import { Types } from 'mongoose';
import SavedTableService from "../../database/services/SavedTableService";

type ReturnedType = (ISavedTable & Required<{
    _id: Types.ObjectId;
}>)

export const updateTableField = async (req: Request, res: Response) => {
    const { tableId, field } = req.body;

    if (!tableId) {
        return res.json({ message: 'Не указан идентификатор таблицы', result: false });
    }

    // Получение и изменение поля таблицы из базы данных
    const savedTable: ReturnedType | undefined = await SavedTableService.updateTableFieldById(tableId, field);

    if (!savedTable) {
        return res.json({ message: 'Таблица не найдена в базе данных', result: false });
    }

    return res.json({ table: savedTable, result: true, message: 'Данные таблицы успешно изменены' });
}