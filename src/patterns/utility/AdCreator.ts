import { IAd } from "../../database/models/Ad";
import { AdService } from "../../database/services/AdService";

export default class AdCreator {
    // Метод для создания или обновления нескольких объявлений
    static async createAdMany(ads: any[], platform: string) {
        const adService: AdService = new AdService();

        // Проходим по каждому объявлению
        for (const el of ads) {
            // Проверяем наличие уникального идентификатора Id
            if (el?.Id) {
                try {
                    // Проверяем существование объявления в базе данных
                    const existingAd: IAd | null = await adService.getAdById(el.Id);

                    if (existingAd) {
                        // Если объявление существует, обновляем его данные
                        await adService.updateAd(existingAd._id, {
                            platform: platform,
                            data: JSON.stringify(el),
                            countFiles: el?.ImageUrls?.length || 0,
                            // Примечание: Не устанавливаем createdAt, так как это поле не изменяется при обновлении
                        });
                    } else {
                        // Если объявление не существует, создаем новое
                        await adService.createAd({
                            _id: el.Id,
                            platform: platform,
                            data: JSON.stringify(el),
                            countFiles: el?.ImageUrls?.length || 0,
                            createdAt: new Date(),
                        });
                    }
                } catch (error) {
                    // Логируем ошибку при создании или обновлении объявления
                    console.error(`Ошибка при обработке объявления с Id ${el.Id}:`, error);
                }
            } else {
                // Логируем предупреждение для объявлений без уникального идентификатора
                console.warn('Пропущено объявление без Id:', el);
            }
        }
    }
}
