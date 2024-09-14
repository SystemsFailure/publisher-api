import { AutoloadService } from "../../database/services/AutoloadService";
import { OfficeCredentialsService } from "../../database/services/OfficeCredentialsService";
import { checkAccess } from "../../helpers/check.access.autoload";
import { getProfileData } from "../../helpers/get.created.profile.avito.api";
import { AuthService } from "../../patterns/strategy/Avito/AvitoStrategy";
import { IAutoloadData, IAutoloadState } from "../../types";
import AvitoAPI from "../avito/avito.api.service";

export default class AvitoAutoloadService {
    private autoloadService: AutoloadService;
    private officeCredentialsService: OfficeCredentialsService;
    private authService: AuthService | null = null;
    private avitoApi: AvitoAPI | null = null;

    constructor() {
        this.autoloadService = new AutoloadService();
        this.officeCredentialsService = new OfficeCredentialsService();
    }

    public async run(id: string, officeId: string) {
        // Получаем учетные данные для работы с API
        const { error: getCredError, cred } = await this.getCredentials(officeId);

        if (getCredError || !cred) {
            return getCredError;
        }

        const { clientId, secretKey, mailAddress } = cred;

        // Инициализируем сервис авторизации
        this.authService = new AuthService(clientId, secretKey);

        // Получаем информацию об автозагрузке по ID
        const { error: getAutoloadError, autoload } = await this.getAutoloadInstance(id);

        if (getAutoloadError || !autoload) {
            return getAutoloadError;
        }

        // Проверяем доступ к публикации
        const access = await checkAccess(autoload.managerId!, 'avito');

        if (!access.result) {
            return { result: access.result, message: access.text };
        }

        // Выполняем основные действия
        const token = await this.authService.token();
        this.avitoApi = new AvitoAPI(token);

        // Подготавливаем данные профиля и выполняем обновление
        const profileData = getProfileData(autoload, mailAddress);
        await this.avitoApi.createOrUpdateProfile(profileData);
        await this.avitoApi.upload();

        // Обновляем статус автозагрузки
        await this.autoloadService.updateAutoload(id, { publicatedAt: new Date() });

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
        // Получаем учетные данные офиса для платформы Avito
        const credentials = await this.officeCredentialsService.getOfficeCredentialsWhere({ officeId, platform: 'avito' });

        if (credentials.length === 0) {
            return { error: { message: 'Не найдены учетные данные офиса для Avito', result: false }, cred: null };
        }

        const { clientId, secretKey, mailAddress } = JSON.parse(credentials[0].toObject().credentials);

        if (!clientId || !secretKey || !mailAddress) {
            return { error: { message: 'Не найдены ключи Avito в записи из базы данных, необходимо проверить поле data', result: false }, cred: null };
        }

        return { result: true, message: 'Учетные данные успешно получены', cred: { clientId, secretKey, mailAddress } };
    }
}
