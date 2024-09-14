import { Request, Response } from "express";
import SavedTableService from '../database/services/SavedTableService';

export const getSavedTableByIdController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const savedTable = await SavedTableService.getSavedTableById(id);
        if (!savedTable) {
            return res.status(404).json({ message: 'SavedTable not found' });
        }
        return res.status(200).json(savedTable.toObject());
    } catch (error) {
        console.error('Error getting saved table:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};