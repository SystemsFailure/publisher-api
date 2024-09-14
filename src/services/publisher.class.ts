import { AdData } from "../types";
import xlsx from 'xlsx';
import { MixinValidateSchema } from '../patterns/mixins/context.mixin';

export type GenericObject = { [key: string]: any };

// Создаем комбинированный класс, который использует миксин
class CombinedClass extends MixinValidateSchema(Object) { }

export class PublisherExcel extends CombinedClass {
  public ads: AdData[];
  protected accessToken: string;

  constructor() {
    super();
    this.ads = [];
    this.accessToken = '';
  }

  // Чтение Excel таблицы
  public readExcel(filePath: string): void {
    const workbook: xlsx.WorkBook = xlsx.readFile(filePath);
    const sheetName: string = workbook.SheetNames[0];
    const worksheet: xlsx.WorkSheet = workbook.Sheets[sheetName];
    const jsonData: AdData[] = xlsx.utils.sheet_to_json(worksheet);
    this.ads = jsonData;
  }

  // Функция для обработки массива объектов
  public transformArray = (arr: GenericObject[]): GenericObject[] => {
    return arr.map(this.transformKeys);
  };

  // Метод для валидации данных
  public validateAds(): (string[] | null)[] {
    return this.validateSchema(this.transformArray(this.ads));
  }

  private transformKeys (obj: GenericObject): GenericObject {
    const transformedObj: GenericObject = {};

    for (const [key, value] of Object.entries(obj)) {
      // Разделяем ключ по "||" и берем часть после знака
      const newKey = key.split('||')[1]?.trim() || key;
      transformedObj[newKey] = typeof value === 'string' ? value.trim() : value;
    }

    return transformedObj;
  };
}