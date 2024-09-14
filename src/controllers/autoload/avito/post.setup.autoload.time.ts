import { Request, Response } from "express";
import AvitoAPI from "../../../services/avito/avito.api.service";
import { AuthService } from "../../../patterns/strategy/Avito/AvitoStrategy"
import { OfficeCredentialsService } from "../../../database/services/OfficeCredentialsService";

// Интерфейс для типизации profileConfig
interface ProfileConfig {
    url: string;
    time_slots: number;
    weekdays: number[];
    officeId: string;
}

// Константы для сообщений об ошибках и уведомлений
const ERROR_MESSAGES = {
    missingProfileConfig: "profileConfig не был передан, либо что-то пошло не так",
    successMessage: "Время автовыгрузки успешно установлено",
    errorMessage: "Произошла ошибка при попытке установить время для автовыгрузки",
};

export const setupAutoloadTimeController = async (req: Request, res: Response) => {
    const { profileConfig } = req.body as { profileConfig: ProfileConfig };

    if (!profileConfig) {
        return res.status(400).send({
            result: false,
            message: ERROR_MESSAGES.missingProfileConfig,
        });
    }

    try {
        const { time_slots, weekdays, officeId } = profileConfig;

        const officeCredentialsService = new OfficeCredentialsService();
        const credentials = await officeCredentialsService.getOfficeCredentialsWhere({ officeId, platform: 'avito' })

        console.log("[credentials]: ", credentials);

        if (credentials.length === 0) {
            res.send({ message: 'Не найдены учетные данные офиса для авито', result: false });
            throw new Error('Не найдены учетные данные офиса для авито');
        }

        const { clientId, secretKey } = JSON.parse(credentials[0].toObject().credentials);

        if (!clientId || !secretKey) {
            res.send({ message: 'Не найдены ключи авито в записи из базы данных, необходимо проверить поле data', result: false });
            throw new Error('Не найдены ключи авито');
        }

        // Создание экземпляра AuthService для аутентификации
        const authService: AuthService = new AuthService(clientId, secretKey);

        const token = await authService.token(); // Получение токена доступа

        // Создание экземпляра AvitoAPI для взаимодействия с API Avito
        const avitoApi = new AvitoAPI(token);

        const profile = await avitoApi.getProfile();

        if (!profile.data.upload_url) {
            return res.send({
                result: false,
                message: "Xml фида по умолчанию нет. Вам необходимо указать ссылку на xml фид",
                data: undefined,
            })
        }

        // Создание конфигурации профиля на основе полученных данных
        const config = {
            agreement: true,
            autoload_enabled: true,
            report_email: "allistirking422@gmail.com",
            schedule: [{
                rate: 300,
                time_slots: [time_slots],
                weekdays,
            }],
            upload_url: String(profile.data.upload_url),
        };

        // Вызов метода API для создания или обновления профиля 
        const responseData = await avitoApi.createOrUpdateProfile(config);

        return res.send({
            result: true,
            message: ERROR_MESSAGES.successMessage,
        });
    } catch (error) {
        console.error("Произошла ошибка при установке времени для автовыгрузки:", error);

        return res.status(500).send({
            result: false,
            message: ERROR_MESSAGES.errorMessage,
            error: error instanceof Error ? error.message : "Внутренняя ошибка сервера",
        });
    }
};
