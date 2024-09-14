import { Request, Response } from "express";
import SavedTableService from '../database/services/SavedTableService';
import { ISavedTable } from "../database/models/SavedTable";

export const patchTableController = async (req: Request, res: Response) => {
    const savedTableId = req.params.id;
    const { managerId } = req.body;
    try {
        const savedTable: ISavedTable | null = await SavedTableService.updateSavedTableById(managerId, savedTableId);

        if(savedTable === null) 
            return res.send({ message: 'Не найдена таблица по данному id либо сбой обновления' });
        
        return res.status(200).json({ 
            table: savedTable,
            result: true,
            message: "Таблица успешно установлена",
         });
    } catch (error) {
        console.error('Error updating saved table:', error);
        return res.json({ message: 'Internal Server Error' });
    }
}