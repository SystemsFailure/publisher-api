import { Request, Response } from 'express';
import { checkCredentials } from './utils';
import YoulaApiPubService from '../../../services/youla/youla.api.service.pub';
import { LaunchData } from '../../../services/youla/types';

export const getYoulaStatusAutoloadController = async (req: Request, res: Response) => {
    const officeId = req.params.officeId;
    const subId: string = req.params.subId;
    // const autoloadId: string = req.params.id;

    try {
        const { tokenApi, userId } = await checkCredentials(officeId, 'youla');
        const youlaApiPubService = new YoulaApiPubService(tokenApi);

        const data: LaunchData = await youlaApiPubService.getLaunchData(subId, userId);

        console.log(
            data,
            data.stats, data.status, data.id
        )

        res.send({ message: 'Успешный запрос статуса автовыгрузки', autoload: data, result: true });
    } catch (error) {
        console.error('[Error getYoulaStatusAutoloadController]', error);
        return res.send({ message: 'Ошибка при запросе статуса автовыгрузки', result: false });
    }
}