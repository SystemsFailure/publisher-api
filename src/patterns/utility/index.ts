import ObjectConverter, { MappingOptions } from '../utility/ObjectConverter';
import FileSaver from './FileSaver';
import { AdObject } from '../../types';
import { DataSaveFileContract, FileContractParams, ReturnedSavedInStorage } from './types';
import { CATEGORY_MAPPING, MATERIAL_TYPE_MAPPING, RENOVATION_MAPPING } from './constants';
import AdCreator from './AdCreator';

// Функция для преобразования объектов по заданным маппингам
async function runConverting(objects: AdObject[]): Promise<any> {
    // Опции для преобразования ключей объектов
    const options: MappingOptions = {
        typeMapping: MATERIAL_TYPE_MAPPING,
        categoryMapping: CATEGORY_MAPPING,
        typeRenovationMapping: RENOVATION_MAPPING,
    };

    // Преобразование объектов с использованием ObjectConverter
    const feed = await ObjectConverter.convertKeysToJson(objects, options);
    return feed;
}

// Функция для сохранения файла и записи его данных в базу данных
async function commonSaveFile(params: FileContractParams): Promise<DataSaveFileContract> {
    const { filePath, data } = params;

    // Сохранение файла в хранилище
    const result: ReturnedSavedInStorage = await FileSaver.saveInStorage(filePath, data.platform);

    // Сохранение информации о файле в базе данных
    const row: DataSaveFileContract = await FileSaver.saveInDatabase({
        ...data,
        name: result.name,
        storagePath: result.storagePath,
    });

    return row;
}

// Функция для создания объявлений на указанной платформе
async function createAds(ads: AdObject[], platform: string): Promise<void> {
    await AdCreator.createAdMany(ads, platform);
}

// Экспорт функций для использования в других модулях
export { runConverting, commonSaveFile, createAds };
