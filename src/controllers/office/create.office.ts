import { Request, Response } from "express";
import { Office } from "../../database/models/Office";

export const createOfficeController = async (req: Request, res: Response) => {
    const { data } = req.body;

    if (!data) {
        return res.send({ result: false, message: "Данные для создания офиса обязательны, проверьте их передачу" });
    }

    const newOffice = await Office.create({ name: data.name, region: data.region._id, address: data.address, code: data.code, createdAt: new Date() });
    console.log("[NEW OFFICE] ", newOffice.toObject());
    return res.send({ result: true, message: "Офис был успешно создан", office: newOffice.toObject() });
}