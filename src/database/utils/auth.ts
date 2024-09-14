import { TokenService } from '../services/TokenService';
import { IToken } from '../models/Token';
import { v4 as uuidv4 } from 'uuid';
import { Types } from 'mongoose';
import jwt from 'jsonwebtoken';
import { JWT_EXPIRATION, JWT_SECRET } from '../../../config';

export default class TokenManager {
    private tokenService: TokenService;

    constructor() {
        this.tokenService = new TokenService();
    }

    async generateToken(managerId: Types.ObjectId): Promise<IToken> {
        // Создаем токен
        const token: string = jwt.sign({ managerId: managerId }, JWT_SECRET!, { expiresIn: '20h' });

        const tokenData: {
            token: string,
            manager: Types.ObjectId,
            createdAt: Date,
            expiresAt: Date
        } = {
            token: token,
            manager: managerId,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 23), // 23 часа + 1 час
        };
        return await this.tokenService.createToken(tokenData);
    }

    async updateToken(oldToken: string): Promise<IToken | null> {
        const existingToken: IToken | null = await this.tokenService.deleteTokenByToken(oldToken);

        if (!existingToken) {
            throw new Error('Token not found');
        }

        const updatedTokenData: Partial<IToken> = {
            token: uuidv4(),
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 часа
        };

        return await this.tokenService.updateToken(existingToken._id!.toString(), updatedTokenData);
    }

    async verifyToken(token: string): Promise<{ valid: boolean, newToken?: string }> {
        // Удаляем токен, если он существует в базе данных
        const existingToken = await this.tokenService.deleteTokenByToken(token);

        if (!existingToken) {
            // Токен не найден, возвращаем invalid
            return { valid: false };
        }

        if (existingToken.expiresAt < new Date()) {
            // Токен истёк, возвращаем invalid
            return { valid: false };
        }

        // Генерируем новый токен
        const newToken: IToken = await this.generateToken(existingToken.manager._id);

        return { valid: true, newToken: newToken.token };
    }

    async getTokenByManager(managerId: Types.ObjectId): Promise<IToken | null> {
        return await this.tokenService.findTokenByManager(managerId);
    }

    async checkToken(oldToken: string) {
        const { valid, newToken } = await this.verifyToken(oldToken);
        return valid ? { result: valid, newToken: newToken } : { result: false, newToken: '' };
    }
}