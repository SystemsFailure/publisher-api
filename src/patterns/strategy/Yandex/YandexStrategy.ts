import { PublisherStrategy } from "../types";
import { AdObject } from "../../../types";
import { convertedInXML } from "../../../helpers/strategy/convert.in.xml";
import { runConverting } from "../../../patterns/utility";
import { runPublic } from "../../../helpers/strategy/run.public";

export default class YandexPublisher implements PublisherStrategy {
    async convert(adsData: AdObject[], modeExcel: boolean): Promise<any> { return await convertedInXML(runConverting, adsData, 'yandex', modeExcel); }
    async publish(filePath: string, managerId?: string, adsCount?: number, feedName?: string) : Promise<any> { return await runPublic(filePath, 'yandex', managerId, adsCount, feedName); }
    valid(data?: any) { console.debug("[DEBUG] Yandex validation:", data) }
}