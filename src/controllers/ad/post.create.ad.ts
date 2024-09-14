import { Request, Response } from "express";
import { createAds } from "../../patterns/utility";

export async function createAdController(req: Request, res: Response) {
    const { ads, platform } = req.body;
    await createAds(ads, platform.toLowerCase());
    console.debug({ message: "Объявление успешно создано", result: true, })
    return res.status(200).json({ message: "Объявление успешно создано", result: true, });
}