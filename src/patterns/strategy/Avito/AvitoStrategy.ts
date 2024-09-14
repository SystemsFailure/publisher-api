import axios, { AxiosInstance } from 'axios';
import { PublisherStrategy } from "../types";
import * as fs from 'fs';
import cheerio from 'cheerio';
import { headers } from '../../../helpers/avito.headers';
import querystring from 'querystring'
import { convertedInXML } from '../../../helpers/strategy/convert.in.xml';
import { runPublic } from '../../../helpers/strategy/run.public';
import { OPTIONS_MAPS } from '../constants';
import { AdObject, AuthorizationResponse, Credentials } from '../../../types';
import { excelModeConverter } from './utils/excel.mode.convert';

export default class AvitoPublisher implements PublisherStrategy {
  constructor() { }

  async convert(adsData: any, modeExcel: boolean): Promise<any> {
    return await convertedInXML(this.convertKeysJson.bind(this), adsData, 'avito', modeExcel);
  }

  async publish(filePath: any, managerId?: string, adsCount?: number, feedName?: string): Promise<any> {
    return await runPublic(filePath, 'avito', managerId, adsCount, feedName);
  }

  valid(fileUrl: string) { // return this.validXMLFile(fileUrl)
    console.debug('[DEBUG ] Avito valid data', fileUrl);
  }

  private convertKeysJson(objects: AdObject[], modeExcel: boolean): any {
    const excludedKeys = new Set(['Площадка', 'RoomArea']);

    const createOptions = (keys: string[], source: { [key: string]: string }, data: any) => {
      return keys
        .filter(key => data[key])
        .map(key => ({ _text: source[key] }));
    };

    return {
      Ads: {
        _attributes: {
          formatVersion: '3',
          target: 'Avito.ru',
        },
        Ad: objects.map(obj => {
          let result: any = {};
          console.log("[DEBUG objects]: ", objects);
          const {
            ContactPhone,
            ImageUrls,
            LeaseAppliances,
            Furniture,
            LeaseMultimedia,
            LeaseComfort,
            ParkingAdditionally,
            BathroomMulti,
            Parking,
            BuiltYear,
            ...rest
          } = obj;

          if (obj.Category === "Дома, дачи, коттеджи") {
            const {
              WallsType,
              LandArea,
              ObjectType
            } = obj;

            if (WallsType) {
              result.WallsType = { _text: WallsType };
            }
            if (ObjectType) {
              result.ObjectType = { _text: ObjectType }
            }
            if (LandArea) {
              result.LandArea = { _text: Number(LandArea) };
            }
          }

          if (BuiltYear) {
            result.BuiltYear = { _text: Number(BuiltYear) };
          }

          if (ContactPhone) {
            const [code, phone] = ContactPhone.split('|').map(part => part.trim());
            result.ContactPhone = { _text: `+${code} ${phone}` };
          }

          if (ImageUrls && !modeExcel) {
            result.Images = {
              Image: ImageUrls.map(({ url }) => ({ _attributes: { url: url.trim() } })),
            };
          }

          const mapAndSetResult = (prop: string, optionsMap: any, source: any) => {
            if (!source || typeof source !== 'object' || !optionsMap || typeof optionsMap !== 'object') {
              return [];
            }
            const options = createOptions(Object.keys(source), optionsMap, obj[prop]);
            if (options.length > 0) {
              result[prop] = { Option: options };
            }
          };

          mapAndSetResult('LeaseAppliances', OPTIONS_MAPS.leaseAppliancesOptions, LeaseAppliances);
          mapAndSetResult('Furniture', OPTIONS_MAPS.furnitureOptions, Furniture);
          mapAndSetResult('LeaseMultimedia', OPTIONS_MAPS.leaseMultimediaOptions, LeaseMultimedia);
          mapAndSetResult('LeaseComfort', OPTIONS_MAPS.leaseComfortOptions, LeaseComfort);
          mapAndSetResult('ParkingAdditionally', OPTIONS_MAPS.parkingAdditionallyOptions, ParkingAdditionally);
          mapAndSetResult('BathroomMulti', OPTIONS_MAPS.bathroomMultiOptions, BathroomMulti);
          mapAndSetResult('Parking', OPTIONS_MAPS.parkingOptions, Parking);

          for (const [key, value] of Object.entries(rest)) {
            if (!excludedKeys.has(key) && value !== undefined && value !== null) {
              result[key] = { _text: value.toString().trim() };
            }
          }

          // Если мы выгружаем объекты через Excel таблицу
          if (modeExcel) {
            console.log("[MODE_EXCEL]: ", 'Выгрузка через Excel таблицу запущена');
            const returnedResult = excelModeConverter(obj, result);
            result = returnedResult;
          }

          return result;
        }),
      },
    };
  }


  // Парсим html результат валидации
  private parseHtmlResponse(htmlString: string): true | number {
    const $ = cheerio.load(htmlString);

    const rows = $('table.report tbody tr').toArray();

    if (!rows) {
      throw new Error('rows is empty or undefined or not valid')
    }

    for (const row of rows) {
      const statusSpan = $(row).find('td span.is-green');
      const itemIdElement = $(row).find('td.item-id');

      if (!statusSpan.length || statusSpan.text() !== 'Соответствует формату') {
        if (itemIdElement.length) {
          const itemId: number = parseInt(itemIdElement.text() || '0', 10);
          return itemId;
        }
      }
    }
    return true;
  }

  // Валидация xml фида через авито xml валидатор
  private async validXMLFile(filePath: string) {
    const url = 'https://autoload.avito.ru/api/v2/public/xml_checker/upload/';
    const xmlData: string = fs.readFileSync(
      filePath,
      'utf-8'
    );

    try {
      const response = await axios.post(url, xmlData, { headers });

      if (!response.data['data'] || !response.data['data']['id']) {
        throw new Error('Данные для дальнейшей валидации не получены')
      }

      const subResponse = await axios.get(`https://autoload.avito.ru/api/v2/public/xml_checker/result/${response.data['data']['id']}/`)

      const html = subResponse.data;
      const result: number | true = this.parseHtmlResponse(html)

      if (!result) {
        console.debug('result is not valid, maybe, NaN')
        return
      }

    } catch (error) {
      console.error('Error uploading file:', error);
    }
  }
}

export class AuthService {
  private readonly axiosInstance: AxiosInstance;
  private accessToken: string = '';
  private static readonly API_URL: string = 'https://api.avito.ru/token';
  private static readonly GRANT_TYPE: string = 'Bearer';

  constructor(private readonly clientId: string, private readonly clientSecret: string) {
    this.axiosInstance = axios.create({
      baseURL: 'https://api.avito.ru',
    })
  }

  public async authorization(credentials: Credentials, grant_type: string = AuthService.GRANT_TYPE): Promise<string> {
    if (!credentials.client_id || !credentials.client_secret) {
      throw new Error('Missing client_id or client_secret in credentials');
    }

    try {
      const { data } = await axios.post<AuthorizationResponse>(AuthService.API_URL, {
        ...credentials,
        grant_type: grant_type
      });
      if (!data.access_token) {
        console.error('No access_token received');
        throw new Error('token no received');
      }

      this.accessToken = data.access_token;
      return this.accessToken;
    } catch (error) {
      console.error(error);
      throw new Error(error as string)
    }
  }
  public async token() {
    const response = await this.axiosInstance.post(
      `/token?${querystring.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'client_credentials',
      })}`
    )
    return response.data.access_token
  }

}
