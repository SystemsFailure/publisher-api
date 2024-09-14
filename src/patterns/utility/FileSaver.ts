import { s3config } from "../../../config";
import { AutoloadService } from "../../database/services/AutoloadService";
import { getFileURL } from "../../helpers/get.storage.path";
import S3Service from "../../storage/s3/selectel.s3";
import { IAutoloadData } from "../../types";
import { ReturnedSavedInStorage } from "./types";

export default class FileSaver {
    static async saveInStorage(filePath: string, platform: string): Promise<ReturnedSavedInStorage> {
        const fileName: string = filePath.split('_')[1];
        if (!fileName) {
            throw new Error('Не получилось извлечь имя файла');
        }
        const key = `files/xml/${platform}/${fileName}`;
        const s3: S3Service = new S3Service(s3config);
        await s3.uploadFile(filePath, key, 'text/xml');
        return {
            storagePath: getFileURL(key),
            name: fileName,
            localPath: filePath,
        };
    }

    static async saveInDatabase(data: IAutoloadData) {
        const autoloadService: AutoloadService = new AutoloadService();
        const result: IAutoloadData = await autoloadService.createAutoload(data);
        if (!result) {
            throw new Error(`Результат записи файла в базу данных : ${result}`);
        }
        console.debug("Данный файл успешно записан в базу данных");
        return result;
    }

    static _repeat() {
        return FileSaver;
    }

}