import { Response, Request } from 'express';
import { Token } from '../../database/models/Token';

export const deleteTokenController = async (req: Request, res: Response) => {
    try {
        const token = req.cookies['token'];
        if (token) {
            await Token.deleteOne({ token });
        }

        res.clearCookie('accessToken');
        res.setHeader('Authorization', '');

        res.status(200).json({ message: 'Токен успешно удален' });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера: deleteTokenController',});
    }
}