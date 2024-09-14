import { Request, Response } from "express";
import { ManagerService } from '../database/services/ManagerService';
import TokenManager from '../database/utils/auth';
import bcrypt from 'bcrypt';
import { IManager } from "../database/models/Manager";
import { IToken } from "../database/models/Token";
import { ManagerOffice } from '../database/models/ManagerOffice';

export const signupController = async (req: Request, res: Response) => {
    const managerService: ManagerService = new ManagerService();
    const tokenManager: TokenManager = new TokenManager();

    try {
        const { login, password, secret_token, officeIds } = req.body;
        const st: string | undefined = process.env.SECRET_TOKEN;

        if (!secret_token) {
            return res.status(400).json({ message: "Секретный токен не был передан, укажите токен в теле запроса" });
        }

        if (!st) {
            return res.status(400).json({ message: "Секретный токен не определен глобально" });
        }

        if (String(st).trim().toUpperCase() !== String(secret_token).trim().toUpperCase()) {
            return res.status(400).json({ message: "Секретный токен не совпадает с токеном, определенным глобально" });
        }

        if (!password || !login) {
            return res.status(400).json({ message: "Login и пароль обязательны" });
        }

        if (!officeIds || officeIds.length === 0) {
            return res.json({ message: "Офис обязательное поле", result: false });
        }

        // Хэшируем пароль
        const hashedPassword: string = await bcrypt.hash(password, 10);
        
        // Создаем нового менеджера с хэшированным паролем
        const newManager: IManager = await managerService.createManager({ login, password: hashedPassword });

        // Создание записи в общей таблице
        for(const officeId of officeIds) {
            console.log('[Debug officeId singup]', officeId);
            await ManagerOffice.create({ officeId: officeId._id, managerId: newManager._id });
        }

        // Генерация токена для нового пользователя
        const token: IToken = await tokenManager.generateToken(newManager._id!);
        // Устанавливаем токен в HTTP-заголовок с флагом httpOnly
        res.cookie('token', token.token, { httpOnly: true });
        res.setHeader('Authorization', `Bearer ${token.token}`);

        // Удаляем пароль из объекта newManager перед отправкой ответа
        const { password: _, ...managerWithoutPassword } = newManager.toObject();

        // Возвращаем токен и экземпляр менеджера назад
        return res.json({
            token: token.token,
            manager: managerWithoutPassword,
        });
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};