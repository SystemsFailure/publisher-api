import { Request, Response } from "express";
import S3Service from "../../storage/s3/selectel.s3";
import { s3config } from "../../../config";
import { S3 } from "aws-sdk";

const s3Service = new S3Service(s3config);

export const getAllFilesInFolderController = async (req: Request, res: Response) => {
    const prefix: string = "files/ads"; // Задаем префикс для поиска файлов в папке ads/files

    try {
        const allFiles: S3.ObjectList = await s3Service.listAllObjects(s3config.bucketName, prefix);
        const mutatedAllFiles = allFiles.map(el => {
            return Object.assign({}, el, {
                url: s3Service.getFileURL(el.Key!)
            })
        })
        res.status(200).json(mutatedAllFiles);
    } catch (error) {
        console.error("Ошибка при получении списка файлов:", error);
        res.status(500).send("Не удалось получить список файлов");
    }
};