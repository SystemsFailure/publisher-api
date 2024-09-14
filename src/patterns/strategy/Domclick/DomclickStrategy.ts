import { PublisherStrategy } from "../types";
import { AdObject } from '../../../types';
import { convertedInXML } from "../../../helpers/strategy/convert.in.xml";
import { runConverting } from "../../../patterns/utility";
import { runPublic } from "../../../helpers/strategy/run.public";

export default class DomClickPublisher implements PublisherStrategy {
    constructor() {}
    async convert(adsData: AdObject[], modeExcel: boolean): Promise<any> { return await convertedInXML(runConverting, adsData, 'domclick', modeExcel); }
    async publish(filePath: string, managerId?: string, adsCount?: number, feedName?: string): Promise<any> { return await runPublic(filePath, 'domclick', managerId, adsCount, feedName); }
    valid(data: string) { console.debug("[DEBUG] Domclick validation:", data) }
}