import { IToken, Token } from '../models/Token';
import { Types } from 'mongoose';
import { TokenRepository } from '../repositories/TokenRepository';

export class TokenService {
    private tokenRepository: TokenRepository;

    constructor() {
        this.tokenRepository = new TokenRepository();
    }

    async createToken(tokenData: {
        token: string,
        manager: Types.ObjectId,
        createdAt: Date,
        expiresAt: Date
    }): Promise<IToken> {
        try {
            return await this.tokenRepository.create(tokenData);
        } catch (error: any) {
            throw new Error(`Error creating token: ${error.message}`);
        }
    }

    async updateToken(id: string, tokenData: Partial<IToken>): Promise<IToken | null> {
        try {
            return await this.tokenRepository.update(id, tokenData);
        } catch (error: any) {
            throw new Error(`Error updating token: ${error.message}`);
        }
    }

    async deleteTokenByToken(token: string): Promise<IToken | null> {
        try {
            return await this.tokenRepository.deleteByToken(token);
        } catch (error: any) {
            throw new Error(`Error deleting token: ${error.message}`);
        }
    }

    async findTokensByManagerId(managerId: Types.ObjectId): Promise<IToken[]> {
        try {
            return await this.tokenRepository.findByManagerId(managerId);
        } catch (error: any) {
            throw new Error(`Error finding tokens by manager ID: ${error.message}`);
        }
    }

    async findTokenByManager(managerId: Types.ObjectId): Promise<IToken | null> {
        return await Token.findOne({ manager: managerId }).populate('manager');
    }

    async deleteToken(managerId: Types.ObjectId): Promise<void> {
        try {
            await this.tokenRepository.deleteMany(managerId);
        } catch (error: any) {
            throw new Error(`Error deleting token: ${error.message}`);
        }
    }
}