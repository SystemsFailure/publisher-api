import { Request, Response } from "express";
import { Office } from "../../database/models/Office";
import { ManagerOffice } from "../../database/models/ManagerOffice";
import { Types } from 'mongoose';

export const getOfficesByManagerController = async (req: Request, res: Response) => {
    const managerId = req.params.managerId;
    if(!managerId || managerId === 'undefined') {
        res.send({ result: false, message: `Id менеджера не валидно: ${managerId}`, managers: null });
    }
    const offices = await getOfficesByManager(managerId);
    return res.send({ result: true, message: "Данные успешно найдены", offices: offices.map(el => el.toObject()) });
}

/**
 * Получить список всех офисов, связанных с данным менеджером
 * @param managerId - ID менеджера, для которого нужно получить список офисов
 * @returns - Промис, который разрешается в массив офисов
 */
async function getOfficesByManager(managerId: Types.ObjectId | string) {
    // Найти все документы ManagerOffice с данным managerId
    const managerOffices = await ManagerOffice.find({ managerId }).exec();

    // Извлечь все officeId из найденных документов
    const officeIds = managerOffices.map(mo => mo.officeId);

    // Найти все офисы по их ID
    const offices = await Office.find({ _id: { $in: officeIds } }).exec();

    return offices;
}