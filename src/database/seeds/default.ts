import mongoose, { Types } from 'mongoose';
import { Region } from '../models/Region';
import { Office } from '../models/Office';

export const config = {
    mongoUri: `mongodb://admin:secret1234@localhost:27017/mydatabase?authSource=admin`
};

mongoose.connect(config.mongoUri)
    .then(() => {
        const regionData = [
            {
                _id: new Types.ObjectId(),
                name: "Краснодар",
                country: "Россия",
                code: "KRD",
                createdAt: new Date(),
            },
            {
                _id: new Types.ObjectId(),
                name: "Москва",
                country: "Россия",
                code: "MOW",
                createdAt: new Date(),
            },
            {
                _id: new Types.ObjectId(),
                name: "Ростов-на-Дону",
                country: "Россия",
                code: "RND",
                createdAt: new Date(),
            },
        ];

        Region.create(regionData)
            .then(() => {
                console.log('Regions created successfully');
                const officeData = [
                    {
                        _id: new Types.ObjectId(),
                        region: regionData[0]._id,
                        code: "KRD129",
                        name: "Офис. Город Краснодар, ул Буденного 129",
                        address: "Краснодар, ул. Буденного 129, 3 этаж, кабинет 3.14",
                        createdAt: new Date(),
                    },
                    {
                        _id: new Types.ObjectId(),
                        region: regionData[1]._id,
                        code: "MOW345",
                        name: "Офис. Город Москва, ул. Тверская 45",
                        address: "Москва, ул. Тверская 45, 4 этаж, кабинет 4.21",
                        createdAt: new Date(),
                    },
                    {
                        _id: new Types.ObjectId(),
                        region: regionData[2]._id,
                        code: "RND567",
                        name: "Офис. Город Ростов-на-Дону, ул. Пушкина 67",
                        address: "Ростов-на-Дону, ул. Пушкина 67, 2 этаж, кабинет 2.10",
                        createdAt: new Date(),
                    },
                ];

                Office.create(officeData)
                    .then(() => {
                        console.log('Offices created successfully');
                        mongoose.disconnect();
                    })
                    .catch((err) => {
                        console.error(err);
                        mongoose.disconnect();
                    });
            })
            .catch((err) => {
                console.error(err);
                mongoose.disconnect();
            });
    })
    .catch((err) => {
        console.error(err);
    });