import { Request, Response } from "express";
import { AutoloadService } from "../database/services/AutoloadService";
import { IAutoloadState } from "../types";

export const updateStatusController = async (req: Request, res: Response) => {
    const paramId = req.params.id;

    const autoloadService = new AutoloadService();
    const updatedAutoload = await autoloadService.updateAutoload(paramId, {
        status: IAutoloadState.published,
    });

    if(!updatedAutoload) throw new Error('updated autoload is not valid, probably, null');

    return res.send({
        answer: updatedAutoload,
        status: 'success',
    })
}