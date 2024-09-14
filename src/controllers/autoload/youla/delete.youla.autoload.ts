import { Request, Response } from "express";
import YoulaApiPubService from "../../../services/youla/youla.api.service.pub";
import { AutoloadService } from "../../../database/services/AutoloadService";
import { checkCredentials } from "./utils";

export const deleteAutoloadYoula = async (req: Request, res: Response) => {
    const autoloadId: string = req.params.id;
    const subId: string = req.params.subId;
    const officeId: string = req.params.officeId;

    const autoloadService = new AutoloadService();

    const autoload = await autoloadService.deleteAutoload(autoloadId);
    console.log('[Deleted autoload]: ', autoload.deletedCount, autoload.acknowledged);

    try {
        const { tokenApi, userId } = await checkCredentials(officeId, 'youla');
        const youlaApiService = new YoulaApiPubService(tokenApi);

        const data = await youlaApiService.getFeedData(subId, userId);
        console.log('data: ', data);

        if (!data) {
            return res.send({ message: 'Не найден фид в текущем профиле для удаления', result: false });
        }

        console.log('[ALL FEEDS]', await youlaApiService.getFeeds(userId));

        await youlaApiService.deleteFeed(subId, userId);
        return res.send({ message: 'Успешно удалено', result: true });
    } catch (error) {
        console.error('[Error deleteAutoloadYoula]', error);
        return res.send({ message: 'Ошибка при удалении', result: false });
    }
}