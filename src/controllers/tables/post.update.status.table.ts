import { Request, Response } from "express";
import SavedTableService from "../../database/services/SavedTableService";


export const updateStatusTable = async (req: Request, res: Response) => {
    const newStatus = req.body.status;
    const tableId = req.params.id;

    const savedTable = await SavedTableService.updateStatus(tableId, newStatus);
    
    if (!savedTable) {
        return res.status(404).json({ message: 'Таблица не была найдена', result: false });
    }

    return res.status(200).json({ table: savedTable, result: true, message: `Статус успешно был обнавлен на ${newStatus}`});
}