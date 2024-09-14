import { Request, Response } from "express";
import S3Service from "../../storage/s3/selectel.s3";
import { s3config } from "../../../config";
import { FileService } from "../../database/services/FileService";
import { IFile } from "../../database/models/File";

export const deleteFileController = async (req: Request, res: Response) => {
    const fileId: string = req.params.id; 
    const s3Service = new S3Service(s3config);
    const fileService = new FileService();

    try {
        // Получаем информацию о файле из базы данных по его id
        const file: IFile | null = await fileService.getFileById(fileId);

        // Проверяем, найден ли файл по указанному id
        if (!file) {
            return res.json({
                message: `Файл с id ${fileId} не найден в базе данных`,
                success: false,
            });
        }

        // Удаляем файл из хранилища (S3)
        await s3Service.deleteFile(file.storagePath);

        // Удаляем запись о файле из базы данных
        const deletedFile: boolean = await fileService.deleteFile(file._id!);

        // Проверяем успешность удаления файла из базы данных
        if (!deletedFile) {
            return res.json({
                message: `Ошибка при удалении файла с id ${fileId} из базы данных`,
                success: false,
            });
        }

        // Возвращаем успешный ответ
        return res.status(200).json({
            message: `Файл успешно удален из хранилища и базы данных`,
            success: true,
        });
    } catch (error) {
        console.error("Ошибка при удалении файла:", error);
        return res.status(500).json({
            message: `Произошла ошибка при удалении файла: ${error}`,
            success: false,
        });
    }
};
