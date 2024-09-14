import { PublisherStrategy } from "../types";
import { runConverting } from '../../../patterns/utility/index';
import { convertedInXML } from "../../../helpers/strategy/convert.in.xml";
import { runPublic } from "../../../helpers/strategy/run.public";
import { AdObject } from '../../../types';

export default class YoulaPublisher implements PublisherStrategy {
  async convert(adsData: AdObject[], modeExcel: boolean): Promise<any> { return await convertedInXML(runConverting, adsData, 'youla', modeExcel); };
  async publish(filePath: string, managerId?: string, adsCount?: number, feedName?: string): Promise<any> { return await runPublic(filePath, 'youla', managerId, adsCount, feedName); };
  valid(data: string) { console.debug("[DEBUG] Youla validation:", data) };
}