import { Request, Response } from "express";
import { checkAccess } from "../../../helpers/check.access.autoload";
import TaskScheduler from "../../../services/queue/queue.service";
import AvitoAutoloadService from "../../../services/autoload/avito.autoload";
import { AutoloadService } from "../../../database/services/AutoloadService";
import { IAutoloadState } from "../../../types";
// import { taskScheduler } from "../../..";

export async function uploadAutoloadAvitoController(req: Request, res: Response) {
  try {
    const id: string = req.params.id;
    const officeId: string = req.params.officeId;

    const { date } = req.body;

    if (!date) {
      return res.send({ message: "Дата или время не были выбраны либо не валидны", result: false });
    }

    if (!id) {
      return res.send({ message: 'Id автовыгрузки не валидно', result: false });
    }

    // Первая проверка данных. 
    // PS: Так же происходит эта же проверка в фоновом режиме, когда задача поступает в отложенную очередь
    const avitoAutoloadService = new AvitoAutoloadService();
    const { error: getCredError } = await avitoAutoloadService.getCredenteals(officeId);
    if (getCredError) {
      return res.send({ ...getCredError });
    }
    const { error: getAutoloadError, autoload } = await avitoAutoloadService.getAutoloadInstance(id);
    if (getAutoloadError || !autoload) {
      return res.send(getAutoloadError);
    }
    const access = await checkAccess(autoload.managerId!, 'avito');
    if (!access.result) {
      return res.send({ result: access.result, message: access.text });
    }

    // await taskScheduler.scheduleTask(date, { platform: 'avito', id, officeId })
    await TaskScheduler.scheduleTask(date, { platform: 'avito', id, officeId })
    
    const autoloadService = new AutoloadService();
    await autoloadService.updateAutoload(id, { status: IAutoloadState.delay });

    const formDate = new Date(date);
    const formattedDate = formDate.toLocaleString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' });

    return res.status(200).send({ result: true, message: `Данные успешно поставлены в очередь на выполнение и будут выгружены на Авито ${formattedDate}`, status: 200 });

  } catch (error: any) {
    console.log("[ERROR PUB AUTOLOAD AVITO]", error, error?.status, `message!!!!: ${error?.message}`);

    if (error?.message === "Request failed with status code 429") {
      return res.send({ result: false, message: 'Превышен лимит кол-ва публикаций для площадки Авито для данного аккаунта компании' });
    }

    if (error?.message === 'API Error: 403 - {"error":{"message":"Создание/обновление профиля недоступно."}}') {
      return res.send({ result: false, message: error?.message });
    }

    return res.send({ message: error, result: false });
  }
}
