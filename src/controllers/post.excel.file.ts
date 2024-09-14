import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import S3Service from "../storage/s3/selectel.s3"; // Убедитесь, что S3Service импортируется правильно
import { s3config } from "../../config";
import { generateRandomId } from "./upload.ads.files.controller";
import { PublisherExcel } from "../services/publisher.class";
import { publishAds } from "../patterns/strategy/ContextStrategy";

const s3Service = new S3Service(s3config);
const poster: PublisherExcel = new PublisherExcel();

// Определяем относительный путь к директории
const relativePath: string = path.join(__dirname, '..', '..', 'src', 'tmp', 'converted', 'excel');

export const createExcelFileController = async (req: Request, res: Response) => {
    const managerId: string = req.params.managerId;
    const file: Express.Multer.File | undefined = req.file;
    const { feedName } = req.body;

    console.log("[DEBUG createExcelFileController]", file, feedName, req.body);

    if (!managerId || managerId === 'undefined') {
        return res.send({ message: "Не передан айди менеджера в параметры createExcelFileController", result: false });
    }

    console.log("[UPLOAD EXCEL START]");

    if (!file) {
        return res.send({ message: "Файл не загружен.", result: false });
    }

    if (!feedName || feedName === 'undefined') {
        return res.send({ message: "Имя фида не указано", result: false });
    }

    // Создаем директорию, если она не существует
    if (!fs.existsSync(relativePath)) {
        fs.mkdirSync(relativePath, { recursive: true });
    }

    const fileName = `${generateRandomId()}-${file.originalname}`;
    const filePath = path.join(relativePath, fileName);
    const s3Key = `files/excel/${fileName}`;

    try {
        // Записываем файл на диск
        fs.writeFileSync(filePath, file.buffer);

        // Прочитаем файл для локального использования
        const fileContent = fs.readFileSync(filePath, 'utf8');

        // Загрузка файла на S3
        await s3Service.uploadFile(filePath, s3Key);

        // Читаем файл
        poster.readExcel(filePath);

        /**
         * Здесь нужно пройти валидацию
         */
        const errors: (string[] | null)[] = poster.validateAds();
        console.debug("[ERRORS VALIDATE]: ", errors);

        if (errors[0] && errors[0]?.length > 0) {
            console.debug(`[ERRORS VALIDATION EXCEL FIELDS]`, errors);
            return res.send({ message: "Файл не прошел валидацию.", result: false, errors: errors });
        }

        // Конвертируем и кидаем на обработку в стратегию
        await publishAds(
            poster.transformArray(poster.ads),
            true,
            managerId,
            feedName,
        );

        // Удаляем локальный файл
        fs.unlinkSync(filePath);

        return res.send({ message: "Файл успешно загружен.", result: true, errors: errors });
    } catch (error) {
        console.error("Ошибка при загрузке файла:", error);

        // В случае ошибки также удаляем локальный файл, если он существует
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        return res.send({ message: "Ошибка при загрузке файла.", result: false });
    }
};