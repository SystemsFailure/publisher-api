import { IToken, Token } from '../models/Token';
import { Types } from 'mongoose';

export class TokenRepository {
    async create(tokenData: {
        token: string,
        manager: Types.ObjectId,
        createdAt: Date,
        expiresAt: Date
    }): Promise<IToken> {
        const newToken = new Token(tokenData);
        return await newToken.save();
    }

    async update(id: string, tokenData: Partial<IToken>): Promise<IToken | null> {
        return await Token.findByIdAndUpdate(id, tokenData, { new: true });
    }

    async deleteByToken(token: string): Promise<IToken | null> {
        return await Token.findOneAndDelete({ token });
    }

    async findByManagerId(managerId: Types.ObjectId): Promise<IToken[]> {
        return await Token.find({ manager: managerId });
    }

    async deleteMany(managerId: Types.ObjectId): Promise<void> {
        await Token.deleteMany({ manager: managerId });
    }
}