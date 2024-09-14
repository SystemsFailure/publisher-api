import { Request, Response } from "express";
import { ManagerService } from '../database/services/ManagerService';
import { TokenService } from '../database/services/TokenService';
import TokenManager from '../database/utils/auth';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const loginController = async (req: Request, res: Response) => {
    const managerService = new ManagerService();
    const tokenService = new TokenService();
    const tokenManager = new TokenManager();
    try {
        const { login, password } = req.body;

        if (!login || !password) {
            return res.json({ message: "Login и пароль обязательны", result: false });
        }

        // Поиск менеджера по логину
        const manager = await managerService.getManagerWhere(login);
        if (!manager) {
            return res.json({ message: "Неверный логин или пароль", result: false });
        }

        const fManager = manager[0];

        if (!fManager) return res.send({ message: 'Менеджер не найден', result: false });

        // Проверка пароля
        const isMatch: boolean = await bcrypt.compare(password, fManager.password);
        if (!isMatch) return res.json({ message: "Неверный логин или пароль", result: false });

        // Удаление старого токена
        await tokenService.deleteToken(fManager._id!);

        // Генерация токена для менеджера
        const token = await tokenManager.generateToken(fManager._id!);

        // Устанавливаем токен в HTTP-заголовок с флагом httpOnly и Authorization
        res.cookie('token', token.token, { httpOnly: true, secure: true });
        res.setHeader('Authorization', `Bearer ${token.token}`);

        // Удаляем пароль из объекта manager перед отправкой ответа
        const { password: _, ...managerWithoutPassword } = fManager.toObject();

        // Возвращаем токен и экземпляр менеджера назад
        return res.json({
            token: token.token, manager: managerWithoutPassword,
            result: true,
            message: '',
        });
    } catch (error: any) {
        console.error(error);
        return res.json({ message: "Internal server error", result: false, error: error });
    }
};