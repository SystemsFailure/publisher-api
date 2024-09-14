import { Request, Response } from "express";
import { FileService } from "../../database/services/FileService";
import { IFile } from "../../database/models/File";
import { getFileURL } from "../../helpers/get.storage.path";

export default async function getAllFileByAdId(req: Request, res: Response) {
    const { filter } = req.body;
    const fileService: FileService = new FileService();

    try {
        const files: IFile[] = await fileService.getAllFiles(filter);
        const copyFiles = files.map(file => {
            return Object.assign({}, { ...file }, {
                url: getFileURL(file.storagePath),
            })
        })
        res.status(200).json({
            files: copyFiles,
            message: `Файлы по данному id ${filter?.adId} успешно найдены`,
            result: true,
        });
    } catch (error) {
        console.error(`Ошибка при получении всех файлов по id ${filter?.adId}:`, error);
        res.status(500).send("Не удалось получить список файлов");
    }
}