import { Request, Response } from "express";
import { FileService } from "../../database/services/FileService";
import { IFile } from "../../database/models/File";
import { getFileURL } from "../../helpers/get.storage.path";

const fileService = new FileService();

export const getAllAdsFilesController = async (req: Request, res: Response) => {
    const { filter } = req.body;
    try {
        const files: IFile[] = await fileService.getAllFiles(filter);
        const copyFiles = files.map(el => {
            return Object.assign({}, el, {
                url: getFileURL(el.storagePath),
            })
        })
        res.status(200).json({
            files: copyFiles,
            message: "Файлы успешно найдены",
            result: true,
        });
    } catch (error) {
        console.error("Ошибка при получении всех файлов:", error);
        res.status(500).send("Не удалось получить список файлов");
    }
};