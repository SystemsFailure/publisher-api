import { Request, Response } from "express";
import { Types } from 'mongoose';
import { ManagerOffice } from "../../database/models/ManagerOffice";
import { Manager } from "../../database/models/Manager";

export const getAllManagersByOffice = async (req: Request, res: Response) => {
    const officeId = req.params.officeId;
    console.log("[OFFICEID]: ", officeId);
    if (!officeId || officeId === 'undefined' || officeId === 'null') {
        return res.send({ result: false, message: `Id офиса не валидно: ${officeId}`, offices: null });
    }
    try {
        const managers = await getManagersByOffice(officeId);
        // Удаление поля password из каждого объекта менеджера
        const managersWithoutPassword = managers.map(manager => {
            const managerObj = manager.toObject();
            managerObj.password = '';
            return managerObj;
        });
        return res.send({ result: true, message: "Менеджеры успешно получены", managers: managersWithoutPassword });
    } catch (error) {
        console.error('Error fetching managers by office:', error);
        return res.status(500).send({ result: false, message: 'Ошибка при получении менеджеров', managers: null });
    }
}

/**
 * Получить список всех менеджеров, связанных с данным офисом
 * @param officeId - ID офиса, для которого нужно получить список менеджеров
 * @returns - Промис, который разрешается в массив менеджеров
 */
async function getManagersByOffice(officeId: Types.ObjectId | string) {
    try {
        // Найти все документы ManagerOffice с данным officeId
        const managerOffices = await ManagerOffice.find({ officeId }).exec();

        // Извлечь все managerId из найденных документов
        const managerIds = managerOffices.map(mo => mo.managerId);

        // Найти всех менеджеров по их ID
        const managers = await Manager.find({ _id: { $in: managerIds } }).exec();

        return managers;
    } catch (error) {
        console.error('Error fetching managers by office:', error);
        throw error;
    }
}
