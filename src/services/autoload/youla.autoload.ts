import { AutoloadService } from "../../database/services/AutoloadService";
import { OfficeCredentialsService } from "../../database/services/OfficeCredentialsService";
import { IAutoloadData, IAutoloadState } from "../../types";
import { FeedResponse } from "../youla/types";
import YoulaApiPubService from "../youla/youla.api.service.pub";

export default class YoulaAutoloadService {
    private autoloadService: AutoloadService;
    private officeCredentialsService: OfficeCredentialsService;

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

        const { tokenApi, userId, userContactId } = cred;

        // Получаем информацию о автозагрузке по ID
        const { error: getAutoloadError, autoload } = await this.getAutoloadInstance(id);

        if (getAutoloadError || !autoload) {
            return getAutoloadError;
        }

        const youlaApiPubService = new YoulaApiPubService(tokenApi);

        // Проверяем существующие фиды
        const existsFeeds: FeedResponse = await youlaApiPubService.getFeeds(userId);

        console.log('METHOD run, YoulaApiService, existsFeeds: ', existsFeeds);

        // Создаем новый фид
        const response = await youlaApiPubService.createFeed(userId, {
            category_id: '20',
            scheme_id: '5bf5153217d97b000151467b',
            title: autoload.name,
            url: autoload.storagePath,
            user_contact_id: userContactId,
        });

        // Создаем публикацию для созданного фида
        await youlaApiPubService.createPublication(response.data.id, userId);

        // Обновляем информацию об автозагрузке
        await this.autoloadService.updateAutoload(autoload._id!, { subId: response.data.id });

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
        // Получаем учетные данные офиса для платформы Youla
        const credentials = await this.officeCredentialsService.getOfficeCredentialsWhere({ officeId, platform: 'youla' });

        if (credentials.length === 0) {
            return { error: { message: 'Не найдены учетные данные офиса для Youla', result: false }, cred: null };
        }

        const { tokenApi, userId, userContactId } = JSON.parse(credentials[0].toObject().credentials);

        if (!tokenApi || !userId || !userContactId) {
            return { error: { message: 'Не найдены ключи Youla в записи из базы данных, необходимо проверить поле data', result: false }, cred: null };
        }

        return { result: true, message: 'Учетные данные успешно получены', cred: { tokenApi, userId, userContactId } };
    }
}
