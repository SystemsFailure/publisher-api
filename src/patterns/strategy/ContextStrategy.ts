import { createAds } from "../../patterns/utility";
import AvitoPublisher from "./Avito/AvitoStrategy";
import CianPublisher from "./Cian/CianStrategy";
import DomClickPublisher from "./Domclick/DomclickStrategy";
import YandexPublisher from "./Yandex/YandexStrategy";
import YoulaPublisher from "./Youla/YoulaStrategy";
import { PublisherStrategy } from "./types";

// Контекст стратегии
class PublisherContext {
  constructor(public strategy: PublisherStrategy) { }

  // Метод для выполнения обобщенного функционала
  async executeStrategy(adsData: any[], modeExcel: boolean, managerId?: string, adsCount?: number, feedName?: string): Promise<any> {
    const convertedFilePath = await this.strategy.convert(adsData, modeExcel);
    const result = await this.strategy.publish(convertedFilePath, managerId, adsCount, feedName);
    await this.strategy.valid(result);
    return result;
  }
}

// Стратегии публикации для различных платформ
const publishers: Record<string, PublisherStrategy> = {
  "Авито": new AvitoPublisher(),
  "Циан": new CianPublisher(),
  "Юла": new YoulaPublisher(),
  "Домклик": new DomClickPublisher(),
  "Яндекс": new YandexPublisher(),
};

// Разделение объявлений по платформам
function splitAdsByPlatform(ads: any[]): Record<string, any[]> {
  return ads.reduce((acc, ad) => {
    const platform = ad['Площадка'];
    acc[platform] = acc[platform] || [];
    acc[platform].push(ad);
    return acc;
  }, {} as Record<string, any[]>);
}

// Публикация объявлений для конкретной платформы
async function handlePlatformAds(platform: string, ads: any[], modeExcel: boolean, managerId?: string, feedName?: string): Promise<any> {
  const context = new PublisherContext(publishers[platform]);
  await createAds(ads, platform.toLowerCase());
  console.log("[MIDDLE DEBUG handlePlatformAds]: ", platform, modeExcel, managerId, ads.length, feedName);
  return await context.executeStrategy(ads, modeExcel, managerId, ads.length, feedName);
}

// Основная функция для публикации всех объявлений
export async function publishAds(adsData: any[], modeExcel: boolean, managerId?: string, feedName?: string): Promise<any[]> {
  console.log(`[PUBLICATION START WITH MODE modeExcel = ${modeExcel}]`);
  console.log(`\n [ОБЪЯВЛЕНИЯ]: `, adsData);
  const adsByPlatform = splitAdsByPlatform(adsData);
  const platforms = Object.keys(adsByPlatform);

  const results = await Promise.all(
    platforms.map(platform => handlePlatformAds(platform, adsByPlatform[platform], modeExcel, managerId, feedName))
  );

  console.log(`[PUBLICATION STOP]`);
  return results;
}