import { Request, Response } from "express";
import { Workbook } from 'exceljs';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

export const getNewExcelController = async (req: Request, res: Response) => {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('My Sheet');

    // Создание заголовков
    const headers = [
        "Площадка", "Id", "Категория||Category", "Фотографии||ImageUrls", "Описание||Description", "Адрес||Address", "Тип операции||OperationType",
        "Контактный телефон||ContactPhone", "Цена||Price", "Площадь комнаты||RoomArea", "Тип комнат||RoomType", "Ремонт||Renovation",
        "Право собственности||PropertyRights", "Тип аренды||LeaseType", "Тип дома||HouseType", "Этаж||Floor", "Этажность||Floors",
        "Комнат||Rooms", "Общая площадь||Square", "Залог||LeaseDeposit", "Комиссия||LeaseCommissionSize", "Площадь кухни||KitchenSpace",
        "Оплата по счетчикам||UtilityMeters", "Другие ЖКУ||OtherUtilities", "Плата за ЖКУ||OtherUtilitiesPayment", "Курение||SmokingAllowed",
        "Дети||ChildrenAllowed", "Животные||PetsAllowed", "AdStatus", 
        "Кондиционер||AirConditioning", "Холодильник||Refrigerator", "Плита||Stove", "Микроволновка||Microwave", "Стиральная машина||WashingMachine",
        "Посудомоечная машина||Dishwasher", "Водонагреватель||WaterHeater", "Телевизор||TV", "Утюг||Iron", "Фен||Hairdryer",
        "Кухня||Kitchen", "Шкафы||Cabinets", "Спальные места||Beds",
        "wi-fi||Wifi", 
        "Камин||Fireplace", "Балкон/Лоджия||BalconyLoggia", "Парковка||Parking",
        "Бесплатная||Free", "Для грузового транспорта||ForTrucks",
        "Подземная||Underground", "Наземная многоуровневая||GroundLevelMultilevel", "Во дворе||OpenYard", "За барьером во дворе||BehindBarrierYard",
        "Совмещенный||Combined", "Раздельный||Separate",
    ];

    worksheet.addRow(headers);

    // Установка ширины колонок
    headers.forEach((header, index) => {
        const column = worksheet.getColumn(index + 1);
        column.width = header.length + 20; // Устанавливаем ширину колонки на длину заголовка + 10
    });

    // Добавление начальных строк данных
    const initialRows = [
        [
            "Авито", "1", "Квартиры", 
            "https://cf5d9d8b-f013-4092-8bb5-7aa3e72dab14.selstorage.ru/files/ads/avito/cvCWhoVlsFekoZ/04d31f49c21b14771f60e05bf47eb978_f66c2f5d0956d082d8ce4c0828d273b8_isLyB-Uydpo.jpg",
            "Новая, просторная, светлая и уютная квартира с ремонтом и большим холодильником. Комнаты изолированные, 11 и 10 метров, кухня 3 метра с балконом.",
            "Тамбовская область, Моршанск, Лесная улица, 7", "Сдам", "7 | 495 777-10-66", "20000", "12,5", "Изолированные", "Дизайнерский", "Посредник",
            "На длительный срок", "Панельный", "3", "12", "2", "121", "0,5 месяца", "100", "33", "Оплачивается арендатором", "Оплачивается арендатором",
            "4500", "Да", "Да", "Да", "Free", "false", "false", "false", "false", "false", "false", "false", "false", "false", "false", "false", "false", "false", "false", "false", "false", "false",
            "false", "false",
            "false", "false", "false", "false",
            "false", "false",
        ],
    ];

    initialRows.forEach(row => {
        const newRow = worksheet.addRow(row);
        newRow.height = 60; // Устанавливаем высоту строки

        newRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            cell.alignment = { wrapText: true }; // Включаем перенос текста для каждой ячейки
        });
    });

    // Генерация уникального имени файла
    const uniqueUUID = uuidv4();
    const dirPath = path.join(__dirname, '../../tmp/newExcel');
    const filePath = path.join(dirPath, `${uniqueUUID}.xlsx`);

    try {
        // Проверка и создание директории, если она не существует
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        // Сохранение файла
        await workbook.xlsx.writeFile(filePath);

        // Отправка файла клиенту
        return res.download(filePath, (err) => {
            if (err) {
                console.error("Error sending the file:", err);
                res.status(500).send("Error sending the file");
            } else {
                // Удаление файла после отправки
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error("Error deleting the file:", err);
                    }
                });
            }
        });
    } catch (error) {
        console.error("Error creating the Excel file:", error);
        return res.status(500).send("Error creating the Excel file");
    }
};