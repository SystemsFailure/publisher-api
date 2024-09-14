// Функция для проверки доступа к запуску автовыгрузки

import { Autoload } from "../database/models/Autoload";
import { IAutoloadState } from "../types";

/**
 * Проверяет, прошло ли больше часа с публикации последних двух записей.
 * @returns Строка с сообщением о доступе или времени ожидания.
 */
export async function checkAccess(managerId: string, platform?: 'avito'): Promise<{ result: boolean, text: string }> {
    try {
        // Получаем последние 2 записи по publicatedAt
        const recentRecords = await Autoload.where({ managerId: managerId, platform: platform, status: IAutoloadState.published })
            .sort({ publicatedAt: -1 }) // Сортировка по убыванию publicatedAt
            .limit(1);

        if (recentRecords.length === 0) {
            return { result: true, text: 'Доступ разрешен' };
        }

        const currentTime = new Date();
        const oneHour = 60 * 60 * 1000; // Один час в миллисекундах

        // Проверяем, если хотя бы одна запись опубликована более чем 1 час назад
        for (const record of recentRecords) {
            const timePassed = currentTime.getTime() - new Date(record.publicatedAt!).getTime();

            if (timePassed >= oneHour) {
                return { result: true, text: 'Доступ разрешен' };
            } else {
                const remainingTime = oneHour - timePassed;
                const remainingMinutes = Math.ceil(remainingTime / (60 * 1000)); // Перевод в минуты
                return { result: false, text: `Лимит превышен, ${remainingMinutes} минут(ы) еще подождать` };
            }
        }

        return { result: false, text: 'Лимит превышен, нет достаточного количества записей для проверки' }; // На случай если все записи моложе 1 часа

    } catch (error) {
        console.error('Ошибка при проверке доступа:', error);
        return { result: false, text: 'Произошла ошибка при выполнении запроса' };
    }
}