import { Request, Response } from "express";
import SavedTableService from '../database/services/SavedTableService';
import { ISavedTable, ISavedTableState } from "../database/models/SavedTable";

export const createSavedController = async (req: Request, res: Response) => {
    try {
        const { data } = req.body;
        
        if (!data) {
            return res.status(400).json({ message: 'Data is required' });
        }

        
        if(data.tableId) {
            const existsTable: ISavedTable | null = await SavedTableService.getSavedTableById(data.tableId)

            if(existsTable) {
                await SavedTableService.updateTableFieldById(data.tableId, data?.data);
                return res.status(200).json({ message: 'Таблица успешно изменена', result: true });
            }
        }


        const savedTable = await SavedTableService.createSavedTable({
            data: data?.data,
            manager: data?.manager,
            status: ISavedTableState.current,
        });
        return res.status(201).json(savedTable);
    } catch (error) {
        console.error('Error creating saved table:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};