import { Ad, IAd } from '../models/Ad';
import { Types } from 'mongoose';

export class AdService {
    async createAd(adData: IAd): Promise<IAd> {
        try {
            const createdAd = await Ad.create(adData);
            return createdAd.toObject(); // Преобразуем Mongoose объект в обычный JavaScript объект
        } catch (error) {
            console.error('Ошибка при создании объявления:', error);
            throw error;
        }
    }

    async getAdById(id: string): Promise<IAd | null> {
        try {
            const ad = await Ad.findById(id);
            return ad ? ad.toObject() : null; // Если объявление найдено, возвращаем его, иначе null
        } catch (error) {
            console.error(`Ошибка при получении объявления по id ${id}:`, error);
            throw error;
        }
    }

    async getAllAds(): Promise<IAd[]> {
        try {
            const ads = await Ad.find({});
            return ads.map(ad => ad.toObject()); // Преобразуем каждый объект Mongoose в обычный JavaScript объект
        } catch (error) {
            console.error('Ошибка при получении всех объявлений:', error);
            throw error;
        }
    }

    async updateAd(id: Types.ObjectId, updatedData: Partial<IAd>): Promise<IAd | null> {
        try {
            const updatedAd = await Ad.findByIdAndUpdate(id, updatedData, { new: true });
            return updatedAd ? updatedAd.toObject() : null;
        } catch (error) {
            console.error(`Ошибка при обновлении объявления с id ${id}:`, error);
            throw error;
        }
    }

    async deleteAd(id: string): Promise<void> {
        try {
            await Ad.findByIdAndDelete(id);
        } catch (error) {
            console.error(`Ошибка при удалении объявления с id ${id}:`, error);
            throw error;
        }
    }
}
