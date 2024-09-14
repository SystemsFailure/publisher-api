import * as xmljs from 'xml-js';
import { generateUniqueId } from "../random.id";
import * as fs from 'fs';

export const convertedInXML = async (collback: Function, objects: any, platform: string = 'avito', modeExcel: boolean = false) => {
    const json = await collback(objects, modeExcel);
    const xml: string = xmljs.js2xml(json, { compact: true, spaces: 4 });

    const filePath: string = `src/tmp/converted/xml/${platform}/_${generateUniqueId()}.xml`

    fs.writeFileSync(filePath, xml);
    console.debug(`successfuly formated in xml ${platform}`)

    return filePath;
}