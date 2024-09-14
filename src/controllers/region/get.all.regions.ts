import { Request, Response } from "express";
import { Region } from "../../database/models/Region";

export const getAllRegionsController = async (_: Request, res: Response) => {
    const regions = (await Region.find()).map(el => {
        return el.toObject();
    });
    return res.send({ result: true, regions });
}