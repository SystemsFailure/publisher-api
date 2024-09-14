import { Request, Response } from "express";
import SavedTableService from '../database/services/SavedTableService';

export const getAllSavedTablesController = async (req: Request, res: Response) => {
    const { filter, managerId } = req.body;
    
    try {
        const savedTables = await SavedTableService.getAllSavedTables(managerId, filter);
        return res.status(200).json(savedTables.map(el => {
            return el.toObject();
        }));
    } catch (error) {
        console.error('Error getting saved tables:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}