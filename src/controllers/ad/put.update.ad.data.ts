import { Request, Response } from 'express';
import { AdService } from '../../database/services/AdService';

export const updateAdDataController = async (req: Request, res: Response) => {
    const { id, data } = req.body;

    const adService = new AdService();
    const updatedAd = await adService.updateAd(id, { data: data });

    if (!updatedAd) {
        return res.json({ message: 'Объявление не найдено', result: false });
    }

    res.json({ message: 'Объявление успешно изменено', result: true, data: updatedAd });
}