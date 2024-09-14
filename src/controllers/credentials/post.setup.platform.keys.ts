import { Request, Response } from 'express';
import { OfficeCredentialsService } from '../../database/services/OfficeCredentialsService';
import { OfficeService } from '../../database/services/OfficeService';
import { Document } from 'mongoose';
import { IOffice } from '../../database/models/Office';
import { Types } from 'mongoose';

type OfficeType = (Document<unknown, {}, IOffice> & IOffice & Required<{
    _id: Types.ObjectId;
}>) | null

const hasOffice = async (officeId: string) => {
    const officeService: OfficeService = new OfficeService();
    const office: OfficeType = await officeService.getOfficeById(officeId);
    return office ? { resultHasOffice: true, office_: office } : { resultHasOffice: false };
}

export const setupPlatformKeysController = async (req: Request, res: Response) => {
    const { platform, officeId } = req.params;
    const bodyData = req.body;

    const platforms: Record<string, string[]> = {
        avito: ['clientId', 'secretKey', 'mailAddress'],
        cian: ['clientId', 'mailAddress'],
        youla: ['tokenApi', 'mailAddress', 'userId', 'userContactId'],
    };

    if (!platform) {
        return res.json({ message: 'Не указана платформа', result: false });
    }

    if (!officeId) {
        return res.json({ message: 'Не указано офис', result: false });
    }

    const platformFields: string[] = platforms[platform];
    const platformData = bodyData[platform];
    console.log('platformData: ', platformData);

    if (!platformData) {
        return res.json({ message: `Не переданы учетные данные для ${platform}`, result: false });
    }

    const missingFields: string[] = platformFields.filter(field => !platformData[field]);

    if (missingFields.length > 0) {
        return res.json({ message: `Не указано ${missingFields.join(', ')} для ${platform}`, result: false });
    }

    console.log('missingFields: ', missingFields);

    const officeCredentialsService: OfficeCredentialsService = new OfficeCredentialsService();

    const { resultHasOffice, office_ } = await hasOffice(officeId);

    if (!resultHasOffice) {
        return res.json({ message: 'Офис не найден', result: false });
    }

    console.log('resultHasOffice: ', resultHasOffice, 'office_: ', office_, 'officeId: ', officeId);

    const hasCredentials = await officeCredentialsService.getOfficeCredentialsWhere({ officeId: officeId, platform: platform });

    console.log('hasCredentials: ', hasCredentials, 'officeId: ', officeId);

    // Обновление уч. данных, если они уже есть
    if (hasCredentials.length > 0) {
        console.log('So Credentials already exists, we update it: ', platformData);
        await officeCredentialsService.updateOfficeCredentials(String(hasCredentials[0].toObject()._id), {
            credentials: JSON.stringify(platformData),
        });
        return res.json({ message: 'Учетные данные обновлены', result: true });
    }

    // Создасть уч. данные если они не существуют относительно платформы
    await officeCredentialsService.createOfficeCredentials({
        credentials: JSON.stringify(platformData),
        officeId: office_!._id,
        platform,
        regionId: office_!.region,
    });

    console.log("END")

    return res.json({ message: 'Учетные данные успешно установлены', result: true });
}