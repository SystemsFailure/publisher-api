import { Request, Response } from 'express';
import { OfficeService } from '../../database/services/OfficeService';

export const getAllOfficesController = async (req: Request, res: Response) => {
    try {
        const officeService = new OfficeService();
        const offices = officeService.getAllOffice();
        const convertedOffices = (await offices).map(el => el.toObject());
        return res.json({ offices_: convertedOffices, result: true });
    } catch (error) {
        return res.json({ result: false, error: error });
    }
}