import { Request, Response } from 'express';
import { checkCredentials } from './utils';
import YoulaApiPubService from '../../../services/youla/youla.api.service.pub';

export const deleteYoulaPublicationAutoloadController = async ( req: Request, res: Response ) => {
    const officeId: string = req.params.officeId;
    const subId: string = req.params.subId;

    const { tokenApi, userId } = await checkCredentials(officeId, 'youla');
    const youlaApiPubService = new YoulaApiPubService(tokenApi);

    const data: boolean = await youlaApiPubService.deletePublication(subId, userId);

    res.send({ message: 'Успешное удаление публикации', result: data });
}