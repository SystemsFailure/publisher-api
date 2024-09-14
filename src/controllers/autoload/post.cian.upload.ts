import { Request, Response } from "express";
import { AutoloadService } from "../../database/services/AutoloadService";
import { OfficeCredentialsService } from "../../database/services/OfficeCredentialsService";
import TaskScheduler from "../../services/queue/queue.service";
import { IAutoloadState } from "../../types";
// import { taskScheduler } from "../..";

export async function uploadAutoloadCianController(req: Request, res: Response) {
    const id = req.params.id;
    const officeId = req.params.officeId;

    const { date } = req.body;

    if (!date) {
        return res.send({ message: "Дата или время не были выбраны либо не валидны", result: false });
    }

    if (!id) {
        res.send({ message: 'Id автовыгрузки не валидно', result: false });
        throw new Error('Id автовыгрузки не валидно');
    }

    if (!officeId || officeId === 'undefined') {
        return res.send({ message: 'officeId не валиден, проверте что отправляется по запросу /upload-start-cian/:id/:officeId', result: false });
    }

    const autoloadService = new AutoloadService();
    const autoload = await autoloadService.getAutoloadById(id);

    if (!autoload) {
        res.send({ message: `autoload экземпляр не валиден или не найден. ID: ${id}`, result: false });
        throw new Error(`autoload экземпляр не валиден или не найден. ID: ${id}`);
    }

    const officeCredentialsService = new OfficeCredentialsService();
    const credentials = await officeCredentialsService.getOfficeCredentialsWhere({ officeId, platform: 'cian' });

    console.log("[credentials cian]:", credentials);

    if (credentials.length === 0) {
        return res.send({ message: 'Не найдены учетные данные офиса для циана', result: false });
    }

    const { clientId, mailAddress } = JSON.parse(credentials[0].toObject().credentials);

    if (!clientId || !mailAddress) {
        return res.send({ message: 'Не найдены ключи циана в записи из базы данных, необходимо проверить поле data', result: false });
    }

    // await taskScheduler.scheduleTask(date, { platform: 'cian', id, officeId })
    await TaskScheduler.scheduleTask(date, { platform: 'cian', id, officeId })

    await autoloadService.updateAutoload(id, { status: IAutoloadState.delay });

    const formDate = new Date(date);
    const formattedDate = formDate.toLocaleString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' });

    return res.send({
        result: true,
        message: `Данные успешно поставлены в очередь на выполнение и будут выгружены на Циан ${formattedDate}`,
        status: 200
    });
}