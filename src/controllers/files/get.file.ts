import { Request, Response } from "express";
import { s3config } from "../../../config";
import S3Service from "../../storage/s3/selectel.s3";

export const getFileController = async (req: Request, res: Response) => {
    const s3Service = new S3Service(s3config);
    const { key } = req.params;

    try {
      await s3Service.deleteFile(key);
      res.status(200).send(`Файл ${key} успешно удален`);
    } catch (error) {
      console.error("Ошибка при удалении файла:", error);
      res.status(500).send("Не удалось удалить файл");
    }
}