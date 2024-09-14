import { Request, Response } from "express"
import { ManagerService } from "../database/services/ManagerService";
import TokenManager from "../database/utils/auth";
import { IManager } from "../database/models/Manager";
import { IToken } from "../database/models/Token";

export const getManagerController = async (req: Request, res: Response) => {
    const id: string = req.params.id;
    const managerService: ManagerService = new ManagerService();
    const tokenManager: TokenManager = new TokenManager();


    if (!id || id === null || id === 'null' || id === 'undefined') {
        return res.send({message: 'managerId явялется не валидным', result: false});
    }

    if (typeof id != 'string') {
        return res.send({ message: 'managerId является не стракой, проверти передоваемое значение', result: false });
    }
    const manager: IManager | null = await managerService.getManagerById(id);
    console.log('[MANAGER]: ', `${id}`, manager);
    if (!manager) return res.send({ message: 'Менеджер с данным id не найден', result: false});
    const token: IToken | null = await tokenManager.getTokenByManager(manager!._id!);
    if (!token) return res.send({ message: 'Токен не найден для данного менеджера', result: false});

    const { password: _, ...managerWithoutPassword } = manager.toObject();

    // Возвращаем токен и экземпляр менеджера назад
    return res.json({
        token: token.token,
        manager: managerWithoutPassword,
        result: true,
    });
}