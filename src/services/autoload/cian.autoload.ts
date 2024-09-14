import { AutoloadService } from "../../database/services/AutoloadService";
import { OfficeCredentialsService } from "../../database/services/OfficeCredentialsService";
import { IAutoloadData, IAutoloadState } from "../../types";
import CianApiService from "../cian/cian.api.service";

export default class CianAutoloadService {
    private autoloadService: AutoloadService;
    private officeCredentialsService: OfficeCredentialsService;

    constructor() {
        this.autoloadService = new AutoloadService();
        this.officeCredentialsService = new OfficeCredentialsService();
    }

    public async run(id: string, officeId: string) {
        // Получаем учетные данные для отправки email
        const { error: getCredError, cred } = await this.getCredentials(officeId);

        if (getCredError || !cred) {
            return getCredError;
        }

        const { clientId, mailAddress } = cred;

        // Получаем информацию об автозагрузке по ID
        const { error: getAutoloadError, autoload } = await this.getAutoloadInstance(id);

        if (getAutoloadError || !autoload) {
            return getAutoloadError;
        }

        // Подготовка данных для отправки письма
        const emailData = {
            accountId: clientId,
            typeUpload: 'тестовая',
            mail: mailAddress,
            xml: autoload.storagePath,
        };

        // Отправка письма через CianApiService
        await CianApiService.getInstance().mail(
            `
                ID аккаунта: ${emailData.accountId} \n
                Тип выгрузки: ${emailData.typeUpload} \n
                Эл.почта: ${emailData.mail} \n
                Ссылка на xml: ${emailData.xml} \n
            `
        );

        return { result: true, message: '' };
    }

    public async getAutoloadInstance(id: string) {
        // Получаем запись автозагрузки по ID
        const autoload: IAutoloadData | null = await this.autoloadService.getAutoloadById(id);

        if (!autoload) {
            return { error: { message: 'По данному ID не была найдена запись в базе данных', result: false }, autoload: null };
        }

        // Проверяем статус автозагрузки
        if (autoload.status === IAutoloadState.published) {
            return { error: { message: 'Автовыгрузка уже опубликована, снимите текущую публикацию', result: false }, autoload };
        }

        return { error: null, autoload };
    }

    public async getCredentials(officeId: string) {
        // Получаем учетные данные офиса для платформы Cian
        const credentials = await this.officeCredentialsService.getOfficeCredentialsWhere({ officeId, platform: 'cian' });

        if (credentials.length === 0) {
            return { error: { message: 'Не найдены учетные данные офиса для Cian', result: false }, cred: null };
        }

        const { clientId, mailAddress } = JSON.parse(credentials[0].toObject().credentials);

        if (!clientId || !mailAddress) {
            return { error: { message: 'Не найдены ключи Cian в записи из базы данных, необходимо проверить поле data', result: false }, cred: null };
        }

        return { result: true, message: 'Учетные данные успешно получены', cred: { clientId, mailAddress } };
    }
}
