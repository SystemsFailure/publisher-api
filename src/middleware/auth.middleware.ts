import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../config';
import { Token } from '../database/models/Token';
import { Manager } from '../database/models/Manager';

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {

    try {
        let token = req.headers['authorization']?.split(' ')[1] || req.cookies['token'];
        if (!token) return res.json({ result: false, message: 'Токен не предоставлен' });
        // Проверка токена
        const decoded: any = jwt.verify(token, JWT_SECRET!);

        // Проверяем наличие токена в базе данных
        const accessToken = await Token.findOne({ token, manager: decoded.managerId, expiresAt: { $gte: new Date() } });
        if (!accessToken) return res.json({ message: 'Токен не совпадает либо просрочен', result: false });

        next();
    } catch (error) {
        return res.json({ result: false, message: 'Токен не валиден' });
    }
}

// EXAMPLE
// const JWT_SECRET = "your_jwt_secret"; // Секретный ключ для JWT

// export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
//     const authHeader = req.headers.authorization;

//     if (authHeader) {
//         const token = authHeader.split(' ')[1]; // Bearer <token>

//         jwt.verify(token, JWT_SECRET, async (err, user) => {
//             if (err) {
//                 return res.status(403).send({ result: false, message: "Неавторизован" });
//             }

//             try {
//                 const foundUser = await Manager.findById(user!._id);
//                 if (!foundUser) {
//                     return res.status(401).send({ result: false, message: "Пользователь не найден" });
//                 }

//                 req.user = foundUser; // Добавляем данные пользователя в запрос
//                 next();
//             } catch (error) {
//                 return res.status(500).send({ result: false, message: "Ошибка при аутентификации" });
//             }
//         });
//     } else {
//         res.status(401).send({ result: false, message: "Токен не предоставлен" });
//     }
// };