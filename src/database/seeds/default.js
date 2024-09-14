"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
var mongoose_1 = require("mongoose");
var Region_1 = require("../models/Region");
var Office_1 = require("../models/Office");
exports.config = {
    mongoUri: "mongodb://admin:secret1234@localhost:27017/mydatabase?authSource=admin"
};
mongoose_1.default.connect(exports.config.mongoUri)
    .then(function () {
    var regionData = [
        {
            _id: new mongoose_1.Types.ObjectId(),
            name: "Краснодар",
            country: "Россия",
            code: "KRD",
            createdAt: new Date(),
        },
        {
            _id: new mongoose_1.Types.ObjectId(),
            name: "Москва",
            country: "Россия",
            code: "MOW",
            createdAt: new Date(),
        },
        {
            _id: new mongoose_1.Types.ObjectId(),
            name: "Ростов-на-Дону",
            country: "Россия",
            code: "RND",
            createdAt: new Date(),
        },
    ];
    Region_1.Region.create(regionData)
        .then(function () {
        console.log('Regions created successfully');
        var officeData = [
            {
                _id: new mongoose_1.Types.ObjectId(),
                region: regionData[0]._id,
                code: "KRD129",
                name: "Офис. Город Краснодар, ул Буденного 129",
                address: "Краснодар, ул. Буденного 129, 3 этаж, кабинет 3.14",
                createdAt: new Date(),
            },
            {
                _id: new mongoose_1.Types.ObjectId(),
                region: regionData[1]._id,
                code: "MOW345",
                name: "Офис. Город Москва, ул. Тверская 45",
                address: "Москва, ул. Тверская 45, 4 этаж, кабинет 4.21",
                createdAt: new Date(),
            },
            {
                _id: new mongoose_1.Types.ObjectId(),
                region: regionData[2]._id,
                code: "RND567",
                name: "Офис. Город Ростов-на-Дону, ул. Пушкина 67",
                address: "Ростов-на-Дону, ул. Пушкина 67, 2 этаж, кабинет 2.10",
                createdAt: new Date(),
            },
        ];
        Office_1.Office.create(officeData)
            .then(function () {
            console.log('Offices created successfully');
            mongoose_1.default.disconnect();
        })
            .catch(function (err) {
            console.error(err);
            mongoose_1.default.disconnect();
        });
    })
        .catch(function (err) {
        console.error(err);
        mongoose_1.default.disconnect();
    });
})
    .catch(function (err) {
    console.error(err);
});
