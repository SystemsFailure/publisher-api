import { Request, Response } from 'express';
import { AutoloadService } from '../../../database/services/AutoloadService';
import { handleError } from '../../../helpers/error.handling';
import { IAutoloadData, IAutoloadState } from '../../../types';
import { checkCredentials } from './utils';
import TaskScheduler from '../../../services/queue/queue.service';
// import { taskScheduler } from '../../..';

export const uploadAutoloadYoula = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const officeId = req.params.officeId;
        const { date } = req.body;

        if (!date) {
            return res.send({ message: "Дата или время не были выбраны либо не валидны", result: false });
        }

        const autoloadService: AutoloadService = new AutoloadService();
        const autoload: IAutoloadData | null = await autoloadService.getAutoloadById(id);

        if (!autoload) {
            res.send({ message: `autoload экземпляр не валиден или не найден. ID: ${id}`, result: false });
            throw new Error(`autoload экземпляр не валиден или не найден. ID: ${id}`);
        }

        const { tokenApi, userId, userContactId } = await checkCredentials(officeId, 'youla');

        if (!tokenApi || !userId || !userContactId) {
            return res.send({ message: 'Не найдены ключи авито в записи из базы данных, необходимо проверить поле data', result: false });
        }

        // await taskScheduler.scheduleTask(date, { platform: 'youla', id, officeId })
        await TaskScheduler.scheduleTask(date, { platform: 'youla', id, officeId })

        await autoloadService.updateAutoload(id, { status: IAutoloadState.delay });

        // Форматирование даты
        const formDate = new Date(date);
        const formattedDate = formDate.toLocaleString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' });

        return res.send({ result: true, message: `Данные успешно поставлены в очередь на выполнение и будут выгружены на Юлы ${formattedDate}`, status: 200 });

    } catch (error: any) {
        handleError(res, error, 'Failed to create autoload');
    }
}