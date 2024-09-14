import { Response, Request } from 'express';
import { JWT_EXPIRATION, JWT_SECRET } from '../../../config';
import jwt from 'jsonwebtoken';
import { Token } from '../../database/models/Token';

export const refreshTokenController = async (req: Request, res: Response) => {
    try {
        const token = req.cookies['token'];
        if (!token) return res.json({ error: 'Токен не предоставлен' });

        const decoded: any = jwt.verify(token, JWT_SECRET!);
        const accessToken = await Token.findOne({ token, manager: decoded.managerId, expiresAt: { $gte: new Date() } });
        if (!accessToken) return res.json({ error: 'Токен не валиден либо просрочен' });

        // Создаем новый токен
        const newToken = jwt.sign({ managerId: decoded.managerId }, JWT_SECRET!, { expiresIn: '20h' });

        // Обновляем токен в базе данных
        accessToken.token = newToken;
        accessToken.expiresAt = new Date(Date.now() + 3600000);
        await accessToken.save();

        // Устанавливаем новый токен в куки и заголовок
        res.cookie('accessToken', newToken, { httpOnly: true });
        res.setHeader('Authorization', `Bearer ${newToken}`);

        res.status(200).json({ message: 'Токен успешно обновлен' });
    } catch (error) {
        res.json({ error: 'Ошибка сервера: refreshTokenController' });
    }
}