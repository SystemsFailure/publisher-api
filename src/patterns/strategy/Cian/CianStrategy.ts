import { PublisherStrategy } from "../types";
import axios from "axios";
import cheerio from 'cheerio';
import { headers } from "../../../helpers/cian.headers";
import { convertedInXML } from "../../../helpers/strategy/convert.in.xml";
import { runPublic } from "../../../helpers/strategy/run.public";
import { MixinValidateSchema } from "../../mixins/context.mixin";

interface AdObject {
  Id: number;
  [key: string]: any; // Позволяет иметь произвольное количество ключей
};

interface ValidationResult {
  success: boolean;
  message?: string;
};

export default
  class CianPublisher
  extends MixinValidateSchema(Object)
  implements PublisherStrategy {
  async convert(adsData: any, modeExcel: boolean): Promise<any> { return await convertedInXML(this.transformJson.bind(this), adsData, 'cian', modeExcel); };
  async publish(filePath: any, managerId?: string, adsCount?: number, feedName?: string): Promise<any> { return await runPublic(filePath, 'cian', managerId, adsCount, feedName); };
  async valid(fileUrl: string): Promise<any> { console.debug('[DEBUG] Cian valid data', fileUrl); };

  private transformJson(objects: AdObject[], modeExcel: boolean): any {
    return {
      feed: {
        feed_version: 2,
        object: objects.map(obj => {
          if (!obj) return null;
          let result: any = {
            ExternalId: { _text: String(obj.Id).trim() },
            Description: { _text: obj.Description?.trim() },
            Address: { _text: obj.Address?.trim() },
            FloorNumber: { _text: obj.Floor },
            FlatRoomsCount: { _text: this.convertFlatRooms(obj.Rooms) },
            TotalArea: { _text: obj.Square },
            KitchenArea: { _text: obj.KitchenSpace },
            ChildrenAllowed: { _text: this.convertChildrenAllowed(obj.ChildrenAllowed) },
            PetsAllowed: { _text: this.convertPetsAllowed(obj.PetsAllowed) },
            Phones: this.transformPhones(obj.ContactPhone),
            RoomArea: { _text: obj.RoomArea },
            BargainTerms: this.transformBargainTerms(obj),
            Building: this.transformBuilding(obj),
            Photos: !modeExcel ? this.transformPhotos(obj.ImageUrls) : undefined,
            Category: undefined,
            RoomType: undefined,
            RepairType: undefined,
            HasConditioner: undefined,
            HasDishwasher: undefined,
            HasFridge: undefined,
            HasTv: undefined,
            HasWasher: undefined,
            HasInternet: undefined,
            LoggiasCount: undefined,
            BalconiesCount: undefined,
            SeparateWcsCount: undefined,
            CombinedWcsCount: undefined,
          };

          result = this.transformCategory(obj, result);
          result = this.transformRoomType(obj, result);
          result = this.transformRepairType(obj, result);

          // Handle photos for Excel mode
          if (modeExcel) {
            const { AirConditioning, Refrigerator, WashingMachine, Dishwasher, TV, Wifi,
              BalconyLoggia, Combined, Separate, Underground, GroundLevelMultilevel, OpenYard, BehindBarrierYard, ImageUrls } = obj;

            if (Array.isArray(ImageUrls) && ImageUrls.length > 0 && ImageUrls) {
              const urls = String(ImageUrls).split(',').map(url => url.trim());
              result.Photos = {
                PhotoSchema: urls.map(url => ({ FullUrl: url.trim(), IsDefault: false }))
              };
            }

            if (AirConditioning) result.HasConditioner = { _text: AirConditioning };
            if (Dishwasher) result.HasDishwasher = { _text: Dishwasher };
            if (Refrigerator) result.HasFridge = { _text: Refrigerator };
            if (TV) result.HasTv = { _text: TV };
            if (WashingMachine) result.HasWasher = { _text: WashingMachine };
            if (Wifi) result.HasInternet = { _text: Wifi };
            if (BalconyLoggia) { result.LoggiasCount = 1; result.BalconiesCount = 1; }
            if (BehindBarrierYard) result.Parking = { Type: '' };
            if (GroundLevelMultilevel) result.Parking = { Type: 'Многоуровневая' };
            if (OpenYard) result.Parking = { Type: 'Открытая' };
            if (Underground) result.Parking = { Type: 'Подземная' };
            if (Combined) result.SeparateWcsCount = { _text: 1 };
            if (Separate) result.CombinedWcsCount = { _text: 1 };
          }

          if (obj.LeaseAppliances) {
            const { AirConditioning, Dishwasher, Refrigerator, TV, WashingMachine } = obj.LeaseAppliances;
            if (AirConditioning) result.HasConditioner = { _text: AirConditioning };
            if (Dishwasher) result.HasDishwasher = { _text: Dishwasher };
            if (Refrigerator) result.HasFridge = { _text: Refrigerator };
            if (TV) result.HasTv = { _text: TV };
            if (WashingMachine) result.HasWasher = { _text: WashingMachine };
          }

          if (obj.LeaseMultimedia && obj.LeaseMultimedia.Wifi) {
            result.HasInternet = { _text: obj.LeaseMultimedia.Wifi };
          }

          if (obj.LeaseComfort && obj.LeaseComfort.BalconyLoggia) {
            result.LoggiasCount = 1;
            result.BalconiesCount = 1;
          }

          if (obj.Parking) {
            const { BehindBarrierYard, GroundLevelMultilevel, OpenYard, Underground } = obj.Parking;
            if (BehindBarrierYard) result.Parking = { Type: '' };
            else if (GroundLevelMultilevel) result.Parking = { Type: 'Многоуровневая' };
            else if (OpenYard) result.Parking = { Type: 'Открытая' };
            else if (Underground) result.Parking = { Type: 'Подземная' };
          }

          if (obj.BathroomMulti) {
            const { Combined, Separate } = obj.BathroomMulti;
            if (Combined) result.SeparateWcsCount = { _text: 1 };
            if (Separate) result.CombinedWcsCount = { _text: 1 };
          }

          // Удаляем все falsy значения из выходного объекта
          Object.keys(result).forEach(key => {
            if (result[key] === undefined || result[key] === null || result[key] === '') {
              delete result[key];
            }
          });

          return result;
        }).filter(Boolean)
      }
    };
  }

  private transformBargainTerms(obj: AdObject): any {
    return {
      LeaseTermType: { _text: this.convertLeaseType(obj.LeaseType) },
      Price: { _text: parseFloat(obj.Price) },
      Deposit: { _text: this.convertLeaseDeposit(obj.LeaseDeposit, obj.Price) },
      UtilitiesTerms: {
        IncludedInPrice: { _text: this.convertIncludedInPrice(obj.UtilityMeters) },
        Price: { _text: parseInt(obj.OtherUtilitiesPayment, 10) }
      },
      ClientFee: { _text: obj.LeaseCommissionSize }
    };
  }

  private transformBuilding(obj: AdObject): any {
    return {
      MaterialType: { _text: this.convertMaterialType(obj.HouseType) },
      FloorsCount: { _text: obj.Floors },
      BuildYear: { _text: Number(obj.BuiltYear) },
    };
  }

  private transformPhones(contactPhone: string): any {
    const [countryCode, number] = contactPhone.split('|').map(part => part.trim());
    return {
      PhoneSchema: {
        CountryCode: { _text: `+${countryCode}` },
        Number: { _text: number }
      }
    };
  }

  private transformPhotos(imageUrls: { url: string }[]): any {
    if (!Array.isArray(imageUrls) || imageUrls.length === 0) return;
    return {
      PhotoSchema: imageUrls.map(image => ({
        FullUrl: image.url,
        IsDefault: false
      }))
    };
  }

  private convertChildrenAllowed(obj: any) {
    switch (obj) {
      case "Да": return true
      case "Нет": return false
      default:
        throw new Error(`Неизвестно разрешение childredAllowed: ${obj}`);
    }
  }

  private convertPetsAllowed(obj: any) {
    switch (obj) {
      case "Да": return true
      case "Нет": return false
      default:
        throw new Error(`Неизвестно разрешение PetsAllowed: ${obj}`);
    }
  }

  private convertFlatRooms(obj: any): number {
    switch (obj) {
      case "Студия":
        return 9;
      case "Своб. планировка":
        return 7;
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
        return parseInt(obj, 10);
      case "6":
      case "8":
      case "10 и более":
        return 6; // многокомнатная квартира (более 5 комнат)
      default:
        throw new Error(`Неизвестное значение комнат: ${obj}`);
    }
  }

  private convertMaterialType(obj: any) {
    switch (obj) {
      case "Блочный": return "block"
      case "Кирпичный": return "bric"
      case "Монолитный": return "monolith"
      case "Монолитно-кирпичный": return "monolithBrick"
      case "Панельный": return "panel"
      case "Деревянный": return "wood"
      default: return null
    }
  }

  // TODO: Здесь устанавливаем категорию исходя из ObjectType свойства
  private transformCategory(obj: any, result: any) {
    // Преобразование значений для Category
    const copyResult = this.deepCopy(result)

    if (!copyResult) {
      console.debug('copyResult is not valid')
      return false
    }

    if (obj['Category'] === 'Квартиры') {
      copyResult['Category'] = { _text: 'flatRent' };
    }

    if(obj.Category === 'Комнаты') {
      copyResult.Category = { _text: 'roomRent' };
    }

    if(obj.Category === 'Дома, дачи, коттеджи') {
      obj.Category = { _text: 'houseRent' }
    }

    return copyResult
  }

  private transformRoomType(obj: any, result: any) {
    // Преобразование значений для RoomType
    const copyResult = this.deepCopy(result);

    if (!copyResult) {
      console.debug('copyResult is not valid', this.transformRoomType.name);
      return false;
    }

    switch (obj['RoomType']) {
      case 'Изолированные':
        copyResult['RoomType'] = { _text: 'separate' };
        break;
      case 'Совмещенные':
        copyResult['RoomType'] = { _text: 'combined' };
        break;
      default:
        copyResult['RoomType'] = { _text: 'both' };
    }

    return copyResult;
  }

  private transformRepairType(obj: any, result: any) {
    const copyResult = this.deepCopy(result);

    if (!copyResult) {
      console.debug('copyResult is not valid', this.transformRoomType.name);
      return false;
    }

    switch (obj['Renovation']) {
      case 'Косметический':
        copyResult['RepairType'] = { _text: 'cosmetic' };
        break;
      case 'Дизайнерский':
        copyResult['RepairType'] = { _text: 'design' };
        break;
      case 'Евроремонт':
        copyResult['RepairType'] = { _text: 'euro' };
        break;
      case 'Без ремонта':
        copyResult['RepairType'] = { _text: 'no' };
        break;
      default:
        copyResult['RepairType'] = { _text: '' };
    }
    return copyResult;
  }

  // Переопределяем условия сделки
  private convertLeaseType(leaseType: string): string {
    switch (leaseType) {
      case 'Посуточно': return 'fewMonths';
      case 'На длительный срок': return 'longTerm';
      default: return '';
    }
  }

  private convertLeaseDeposit(leaseDeposit: string, price: string): number {
    const priceInt = parseInt(price, 10);
    switch (leaseDeposit.trim()) {
      case 'Без залога': return 0;
      case '0,5 месяца': return Math.round(priceInt * 0.5);
      case '1 месяц': return priceInt;
      case '1,5 месяца': return Math.round(priceInt * 1.5);
      case '2 месяца': return priceInt * 2;
      case '2,5 месяца': return Math.round(priceInt * 2.5);
      case '3 месяца': return priceInt * 3;
      default: return 0;
    }
  }

  private convertIncludedInPrice(obj: any) {
    // obj['UtilityMeters']
    switch (obj) {
      case 'Оплачивается арендатором':
        return false;
      case 'Оплачивается собственником':
        return true;
      default:
        return null;
    }
  }

  private convertImgs(obj: any) {

  }

  private extractValidationResult(html: string): ValidationResult {
    const $ = cheerio.load(html);

    const resultContainer = $('#validateResultContainer');
    if (resultContainer.length === 0 || resultContainer.css('display') === 'none') {
      return { success: false };
    }

    const resultElement = resultContainer.find('.xmlval_result .success');
    if (resultElement.length > 0) {
      return {
        success: true,
        message: resultElement.text().trim(),
      };
    }

    return { success: false };
  }

  /** 
   * Draft Глубокая копия объекта, lodash не хотелось ставить только из-за одной функции
  */
  private deepCopy(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    let copy: any;
    if (Array.isArray(obj)) {
      copy = [];
    } else {
      copy = {} as Record<string, any>;
    }

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        copy[key] = this.deepCopy(obj[key]);
      }
    }

    return copy;
  }

  // Валидация фида xml на сервисе циана
  async validXMLFile(fileUrl: string) {
    const url: string = 'https://www.cian.ru/api/validator/validate/';
    // Remembership: Нужно делать записи xml файла в mongodb с его uid и url после сохранения в удаленном хранилище
    try {
      const response = await axios.post(url, {
        url: fileUrl // Сюда надо прокидывать url xml файла,
      }, { headers });

      if (!response.data) {
        throw new Error('Данные для дальнейшей валидации не получены')
      }

      const sleep = (ms: number): Promise<void> => {
        return new Promise(resolve => setTimeout(resolve, ms));
      };
      await sleep(15_000);

      const _response = await axios.get(`https://www.cian.ru/nd/validator/?Id=${response.data}`)
      const html = _response.data;
      const result: ValidationResult = this.extractValidationResult(html)
      console.debug('Результат провекри xml фида для Циана: ', result);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  }
}
