import { Schema, model, Document, Types } from 'mongoose';

export interface IToken extends Document {
    _id?: Types.ObjectId;
    manager: Types.ObjectId;
    token: string;
    expiresAt: Date;
    createdAt: Date;
}

const TokenSchema = new Schema<IToken>({
    _id: { type: Schema.Types.ObjectId, default: () => new Types.ObjectId() },
    manager: { type: Schema.Types.ObjectId, ref: 'Manager', required: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, expires: '20h' }, // Изменено на 20 часов
    createdAt: { type: Date, default: Date.now },
});

export const Token = model<IToken>('Token', TokenSchema);